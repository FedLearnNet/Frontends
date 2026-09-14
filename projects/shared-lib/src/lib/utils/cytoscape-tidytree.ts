import cytoscape from 'cytoscape';


export const DEFAULT_LAYOUT_OPTIONS = {
  name: 'tidytree',  // Verwende das tidytree-Layout
  // Zusätzliche Optionen für das Tidytree-Layout
  direction: 'TB',  // 'TB' = Top-Bottom; andere Optionen sind 'LR', 'RL', 'BT'
  gapVertical: 50,  // Vertikaler Abstand zwischen den Knoten
  gapHorizontal: 100,  // Horizontaler Abstand zwischen den Knoten
  depthSort: true,  // Sortiert die Knoten auf derselben Ebene
  horizontalSpacing: 20,
  verticalSpacing: 40,
  animate: false,
  fit: true,
  animationEasing: "ease-in-out",
  animationDuration: 600,
}

export function applyLayout(cy: cytoscape.Core, options: cytoscape.LayoutOptions) {
  (options as any).edgeComparator = (edge1: any, edge2: any) => {
    return edgeComparator(edge1, edge2);
  }
  (options as any).animate = true;
  cy.layout(options).run();
}

export function edgeComparator(edge1?: any, edge2?: any) {
  if (!edge1 || !edge2) {
    return 0;
  }
  const child1 = edge1.target();
  const child2 = edge2.target();
  const order1 = scratch(child1).order
  const order2 = scratch(child2).order
  if (order1 === undefined && order2 === undefined) {
    return child1.id() - child2.id();
  }
  if (order1 === undefined) {
    return 1;
  }
  if (order2 === undefined) {
    return -1;
  }
  return order1 - order2;
}

export function _handleDragStart(event?: cytoscape.EventObject) {
  if (!event) {
    return;
  }
  const dragged = event.target;
  const draggedPos = dragged.position();

  // Save the position at the start of the drag to use in _handleDragEnd
  scratch(dragged).dragOrigPos = {...draggedPos};

  // Update the position of children when the node is moved
  // get descendants and their current positions relative to parent
  const children = dragged.successors("node");
  const relPositions = new Map();
  let limit = 300; // the limit of descendants to move to avoid lag
  children.forEach((child: cytoscape.NodeSingular) => {
    const childPos = child.position();
    relPositions.set(child, {
      x: childPos.x - draggedPos.x,
      y: childPos.y - draggedPos.y
    });
    limit--;
    if (limit < 0) {
      return; // stop iterating (https://js.cytoscape.org/#eles.forEach)
    }
  });

  // apply the saved relative positions
  const handler = (event?: cytoscape.EventObject) => {
    if (!event) {
      return;
    }
    const targetPos = event.target.position();
    for (const [child, relPos] of relPositions) {
      child.position({
        x: targetPos.x + relPos.x,
        y: targetPos.y + relPos.y
      });
    }
  };
  scratch(dragged).moveChildrenHandler = handler; // save handler to remove later
  dragged.on('position', handler);
}

export function _handleDragEnd(event: cytoscape.EventObject,
                               cy: cytoscape.Core,
                               options: cytoscape.LayoutOptions,
                               verticalSpacing: number = 50) {
  if (!event) {
    return;
  }
  const dragged = event.target;
  //const origPos = scratch(dragged).dragOrigPos;
  const draggedPos = dragged.position();

  dragged.removeListener('position', scratch(dragged).moveChildrenHandler);
  scratch(dragged).moveChildrenHandler = undefined;


  const parent = dragged.incomers("node");

  // Recalculate order based on the current x's
  const siblings = parent
    .outgoers("node")
    .sort((a: cytoscape.NodeSingular, b: cytoscape.NodeSingular) => a.position().x - b.position().x);
  siblings.forEach((sibling: cytoscape.NodeSingular, i: number) => {
    scratch(sibling).order = i;
  });

  // Set node's extra spacing based on the drag final position
  const parentPos = parent.position();
  if (!parentPos || !draggedPos) {
    return;
  }
  const newSpacing = draggedPos.y - (parent.position().y + parent.outerHeight() + verticalSpacing);
  scratch(dragged).extraVerticalSpacing = newSpacing > 0 ? newSpacing : undefined;
  applyLayout(cy, options);
}

export function clearPerNodeSettings(cy: cytoscape.Core, options: cytoscape.LayoutOptions) {
  cy.nodes().forEach(node => {
    scratch(node).order = undefined;
    scratch(node).extraVerticalSpacing = undefined;
  });
  applyLayout(cy, options);
}


export function scratch(node: cytoscape.NodeSingular) {
  if (node.scratch("_tidytree-treeviewer") === undefined) {
    node.scratch("_tidytree-treeviewer", {});
  }
  return node.scratch("_tidytree-treeviewer");
}


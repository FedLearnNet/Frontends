export interface NetworkAccessTool {
  name?: string | null;
  needsInternetAccess?: boolean | null;
  needsHostAccess?: boolean | null;
}

export interface NetworkAccess {
  internetTools: string[];
  hostTools: string[];
}

export const NO_NETWORK_ACCESS: NetworkAccess = {internetTools: [], hostTools: []};

export function networkAccessOf(tools: (NetworkAccessTool | null | undefined)[]): NetworkAccess {
  const present = tools.filter((tool): tool is NetworkAccessTool => !!tool);
  return {
    internetTools: toolNames(present.filter(tool => tool.needsInternetAccess)),
    hostTools: toolNames(present.filter(tool => tool.needsHostAccess)),
  };
}

export function hasNetworkAccess(access: NetworkAccess): boolean {
  return access.internetTools.length > 0 || access.hostTools.length > 0;
}

function toolNames(tools: NetworkAccessTool[]): string[] {
  return [...new Set(tools.map(tool => tool.name || '?'))];
}

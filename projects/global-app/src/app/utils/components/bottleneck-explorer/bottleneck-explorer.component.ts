import {NgTemplateOutlet} from '@angular/common';
import {afterNextRender, ChangeDetectionStrategy, Component, computed, DestroyRef, input, inject, signal} from '@angular/core';

export type BottleneckMode = 'problem' | 'solution';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** One lettered finding (A, B, C) and the parts of the figure it points at. */
interface Finding {
  targets: string[];
  text: string;
}

interface Bottleneck {
  id: string;
  short: string;
  title: string;
  subtitle: string;
  problem: Finding[];
  solution: Finding[];
  /** Red example values shown inside the problem figure, by element id (`data-1`, `agg-formula`, …). */
  problemLines: Record<string, string[]>;
  /** Green labels added to the FL-Net figure, by element id. */
  solutionTags: Record<string, string>;
  /** What the evaluation showed. */
  proof: string;
}

interface ProblemSite {
  id: string;
  label: string;
  x: number;
  width: number;
  records: string;
  tone: 'violet' | 'green';
}

interface PlatformItem extends Box {
  id: string;
  label: string;
}

interface Highlight {
  id: string;
  letter: string;
  index: number;
  box: Box;
}

const LETTERS = 'ABC';

/**
 * The five bottlenecks of federated learning in clinical practice. Each one is first shown on the
 * plain federated learning figure (what goes wrong), then on the FL-Net figure (how FL-Net solves it).
 */
@Component({
  selector: 'app-bottleneck-explorer',
  templateUrl: './bottleneck-explorer.component.html',
  styleUrl: './bottleneck-explorer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
})
export class BottleneckExplorerComponent {
  readonly project = input<string>('FL-Net');
  readonly letters = LETTERS;

  // Problem figure: the federated learning round without FL-Net.
  readonly SITE_Y = 150;
  readonly SITE_H = 280;
  readonly CARD_Y = 212;
  readonly AGG_BOTTOM = 90;

  // Solution figure: the FL-Net platform above one site.
  readonly PLATFORM_BOTTOM = 122;
  readonly SOL_SITE = {x: 16, y: 196, w: 474, h: 236};
  readonly SOL_CARD_Y = 258;
  readonly SOL_CARD_H = 150;

  readonly bottlenecks: Bottleneck[] = [
    {
      id: 'B1', short: 'Data dialects',
      title: 'Every site speaks its own dialect',
      subtitle: 'Local systems need shared meaning, shared value formats and quality control.',
      problem: [
        {targets: ['data'], text: 'Same concept, different names, codes and units per site.'},
        {targets: ['train'], text: 'No shared semantics or validation: invalid values slip into training.'},
        {targets: ['agg-formula'], text: 'The aggregator averages non-comparable inputs.'},
      ],
      solution: [
        {targets: ['schema'], text: 'Ontology, DataTypes and Schema set one shared vocabulary for every site.'},
        {targets: ['etl'], text: 'Each site maps its own format to the Schema; every value is validated against its DataType before it is loaded.'},
      ],
      problemLines: {
        'data-1': ['Sex: male/female', 'hbA1c: ‘> 8’ / ‘< 8’'],
        'data-2': ['Sex: 1/0', 'a1c class: 0–3', 'age: missing'],
        'train-1': ['Inputs not aligned'],
        'train-2': ['Inputs not aligned'],
      },
      solutionTags: {etl: 'Validated'},
      proof: 'Six differently formatted sources: 100% of records imported, 0 rejections, by configuration alone.',
    },
    {
      id: 'B2', short: 'Patient discovery',
      title: 'Patient discovery before training',
      subtitle: 'Data feasibility must be established across sites before training.',
      problem: [
        {targets: ['agg-query'], text: 'Researchers cannot tell how many eligible patients each site holds before training.'},
        {targets: ['data'], text: 'Checking eligibility needs manual requests that risk patient re-identification.'},
      ],
      solution: [
        {targets: ['ddq', 'project'], text: 'The same data discovery query (DDQ) goes to every site and is resolved against the Schema.'},
        {targets: ['etl'], text: 'Counts below k become 0, the rest are rounded up; queries and matched patients are logged locally.'},
      ],
      problemLines: {
        'data-1': ['? records', 'Eligible for study?'],
        'data-2': ['? records', 'Eligible for study?'],
      },
      solutionTags: {etl: 'Found N'},
      proof: '13 queries on 4 sites, repeated 3×: identical counts, and no exact number left a site (401 → 410, 87 → 0).',
    },
    {
      id: 'B3', short: 'Versioned workflows',
      title: 'Reusable and versioned federated workflows',
      subtitle: 'Federated workflows should be persistent, versioned and reusable across sites.',
      problem: [
        {targets: ['train'], text: 'Each site runs its own copied variant of the FL code; some partners end up on V1, others on V2.'},
        {targets: ['agg-formula'], text: 'Hyperparameters and dependencies drift without versioned tools.'},
      ],
      solution: [
        {targets: ['aggregator', 'train'], text: 'The same versioned Tool (FL-Net Tool A) runs at every site and at the aggregator.'},
        {targets: ['project'], text: 'The workflow is stored, so the same run can be repeated later.'},
      ],
      problemLines: {
        'train-1': ['train_1.py'],
        'train-2': ['train_final.py'],
        'agg-formula': ['my_fed_avg.py'],
      },
      solutionTags: {train: 'v4, audited'},
      proof: 'The same Tool reached central-level AUROC on 3 to 50 sites.',
    },
    {
      id: 'B4', short: 'Secure access',
      title: 'Secure and auditable access',
      subtitle: 'Updates, metadata and outputs need authentication, encryption and an audit trail.',
      problem: [
        {targets: ['data'], text: 'Site owners cannot limit access; there is no audit trail of who saw what.'},
        {targets: ['train'], text: 'Training code runs on patient data without review or isolation.'},
        {targets: ['lock'], text: 'Sites and updates are unauthenticated; ΔW travels unencrypted.'},
      ],
      solution: [
        {targets: ['etl'], text: 'Site owners set cohort permissions and approve every request.'},
        {targets: ['train'], text: 'Only built, containerized and scanned Tools run, isolated from the network.'},
        {targets: ['channels', 'site-header'], text: 'Sites authenticate via Keycloak/OIDC, and every channel is encrypted.'},
      ],
      problemLines: {
        'data-1': ['No site approval', 'No access control', 'No audit log'],
        'data-2': ['No site approval', 'No access control', 'No audit log'],
        'train-1': ['Unchecked code', 'Internet access'],
        'train-2': ['Unchecked code', 'Internet access'],
      },
      solutionTags: {etl: 'Permissions', train: 'Scanned', 'site-header': 'OIDC user'},
      proof: 'Unpermitted queries are rejected, counts under 100 return zero, and every access is logged.',
    },
    {
      id: 'B5', short: 'Traceability',
      title: 'Traceability of approvals, versions and results',
      subtitle: 'Approvals, versions, sites and outputs must stay linked to each run.',
      problem: [
        {targets: ['result'], text: 'Results are not kept in a standard form.'},
        {targets: ['site'], text: 'Site participation and approvals are not recorded.'},
        {targets: ['agg-formula'], text: 'Tool versions and parameters are not stored with the result.'},
      ],
      solution: [
        {targets: ['site-header'], text: 'Participating sites and approved patient counts are recorded immutably.'},
        {targets: ['project'], text: 'An immutable run configuration fixes the Tool versions.'},
        {targets: ['result', 'inference'], text: 'Artifacts stay at each hospital; an Inference-Tool keeps the full provenance.'},
      ],
      problemLines: {
        'result-1': ['Reports.html'],
        'result-2': ['Reports.html'],
        'site-1': ['Approval ?'],
        'site-2': ['Approval ?'],
        'agg-formula': ['Which algorithm and params?'],
      },
      solutionTags: {'site-header': 'Approved 1349 patients', result: 'Provenance'},
      proof: 'Which patients and which code produced a model: still answerable a year later.',
    },
  ];

  readonly activeIndex = signal(0);
  readonly mode = signal<BottleneckMode>('problem');
  readonly selected = signal(0);
  readonly compact = signal(false);
  /** Bottlenecks whose solution the visitor has opened, marked in the overview. */
  readonly seen = signal<ReadonlySet<string>>(new Set());

  readonly active = computed(() => this.bottlenecks[this.activeIndex()]);
  readonly findings = computed(() => this.mode() === 'problem' ? this.active().problem : this.active().solution);
  readonly isLast = computed(() => this.activeIndex() === this.bottlenecks.length - 1);

  readonly problemSites = computed<ProblemSite[]>(() => {
    const sites: ProblemSite[] = [
      {id: '1', label: 'Site 1', x: 16, width: 440, records: '12,400', tone: 'violet'},
      {id: '2', label: 'Site 2', x: 472, width: 440, records: '18,200', tone: 'green'},
    ];
    return this.compact() ? sites.slice(0, 1) : sites;
  });
  readonly problemWidth = computed(() => this.compact() ? 472 : 928);
  readonly solutionWidth = computed(() => this.compact() ? 506 : 928);

  readonly platformItems = computed<PlatformItem[]>(() => {
    const compact = this.compact();
    const items = [
      {id: 'schema', label: 'Schema', w: compact ? 70 : 96},
      {id: 'ddq', label: 'DDQ', w: compact ? 52 : 70},
      {id: 'project', label: 'Project', w: compact ? 52 : 70},
      {id: 'aggregator', label: 'Aggregator', w: compact ? 112 : 200},
      {id: 'inference-tool', label: compact ? 'Inf. tool' : 'Inference tool', w: compact ? 60 : 96},
      {id: 'inference-run', label: 'Inference', w: compact ? 54 : 76},
    ];
    const gap = compact ? 12 : 22;
    let x = compact ? 24 : 128;
    return items.map(item => {
      const placed = {...item, x, y: compact ? 50 : 38, h: compact ? 62 : 72};
      x += item.w + gap;
      return placed;
    });
  });

  readonly solutionCards = [
    {id: 'data', label: 'Local data store', base: 'Own format', n: 1},
    {id: 'etl', label: 'ETL', base: '✓ Schema A', n: 2},
    {id: 'train', label: 'Local training', base: 'FL-Net Tool A', n: 3},
    {id: 'result', label: 'Result', base: 'Stored at site', n: 4},
  ].map((card, i) => ({...card, x: 32 + i * 114, y: this.SOL_CARD_Y, w: 100, h: this.SOL_CARD_H}));

  /** Solution connectors: data discovery (both ways), the new model down, the update up. */
  readonly channels = [
    {id: 'ddq', x: 196, label: 'DDQ; others', w: 100, n: null, dir: 'both'},
    {id: 'down', x: 310, label: 'W(t+1)', w: 64, n: 6, dir: 'down'},
    {id: 'up', x: 424, label: 'ΔW₁', w: 56, n: 4, dir: 'up'},
  ] as const;

  readonly netNodes = [
    ...[30, 54].map(y => ({x: 18, y, kind: 'in'})),
    ...[16, 32, 52, 68].map(y => ({x: 44, y, kind: 'hidden'})),
    ...[16, 32, 52, 68].map(y => ({x: 76, y, kind: 'hidden'})),
    ...[30, 54].map(y => ({x: 102, y, kind: 'out'})),
  ];
  readonly netEdges = this.netNodes.flatMap(from => this.netNodes
    .filter(to => to.x > from.x && this.netNodes.find(n => n.x > from.x)?.x === to.x)
    .map(to => ({x1: from.x, y1: from.y, x2: to.x, y2: to.y})));

  readonly weightCells = [
    '#5f6368', '#e3e3e3', '#bdbdbd', '#ececec',
    '#bdbdbd', '#9e9e9e', '#ececec', '#d0d0d0',
    '#e3e3e3', '#d0d0d0', '#5f6368', '#bdbdbd',
  ].map((fill, i) => ({fill, x: 15 + (i % 4) * 24, y: 18 + Math.floor(i / 4) * 20, i}));

  /** Every figure element the current findings point at, with the finding's letter. */
  readonly highlights = computed<Highlight[]>(() => this.findings().flatMap((finding, index) =>
    this.expand(finding.targets).map(id => ({
      id,
      index,
      letter: LETTERS[index],
      box: this.inflate(this.bounds(id), 6),
    }))));

  private readonly targeted = computed(() => new Set(this.highlights().map(h => h.id)));

  constructor() {
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const narrow = window.matchMedia('(max-width: 760px)');
      const onWidth = () => this.compact.set(narrow.matches);
      onWidth();
      narrow.addEventListener('change', onWidth);
      destroyRef.onDestroy(() => narrow.removeEventListener('change', onWidth));
    });
  }

  choose(index: number): void {
    this.activeIndex.set(index);
    this.mode.set('problem');
    this.selected.set(0);
  }

  toggleMode(): void {
    const solving = this.mode() === 'problem';
    this.mode.set(solving ? 'solution' : 'problem');
    this.selected.set(0);
    if (solving) {
      this.seen.update(seen => new Set(seen).add(this.active().id));
    }
  }

  next(): void {
    this.choose((this.activeIndex() + 1) % this.bottlenecks.length);
  }

  select(index: number): void {
    this.selected.set(index);
  }

  /** Parts no finding points at fade back, as on the slides. */
  dimmed(id: string): boolean {
    return !this.targeted().has(id);
  }

  lines(id: string): string[] {
    return this.mode() === 'problem' ? this.active().problemLines[id] ?? [] : [];
  }

  tag(id: string): string | null {
    return this.mode() === 'solution' ? this.active().solutionTags[id] ?? null : null;
  }

  /** B4 shows the locks open: nothing on the channel is authenticated or encrypted. */
  locksOpen(): boolean {
    return this.mode() === 'problem' && this.targeted().has('lock-1');
  }

  downX(site: ProblemSite): number {
    return site.x + 220;
  }

  upX(site: ProblemSite): number {
    return site.x + 364;
  }

  tagWidth(text: string): number {
    return text.length * 7 + 22;
  }

  /** Targets that exist once per site in the problem figure are expanded to every visible site. */
  private expand(targets: string[]): string[] {
    if (this.mode() === 'solution') {
      return targets.flatMap(id => id === 'inference' ? ['inference-tool', 'inference-run'] : [id]);
    }
    return targets.flatMap(id => ['data', 'train', 'result', 'lock', 'site'].includes(id)
      ? this.problemSites().map(site => `${id}-${site.id}`)
      : [id]);
  }

  private bounds(id: string): Box {
    if (this.mode() === 'problem') {
      return this.problemBounds(id);
    }
    const item = this.platformItems().find(i => i.id === id);
    if (item) {
      return item;
    }
    const card = this.solutionCards.find(c => c.id === id);
    if (card) {
      return card;
    }
    const site = this.SOL_SITE;
    if (id === 'site-header') {
      return {x: site.x + 6, y: site.y + 4, w: 250, h: 42};
    }
    // channels
    return {x: 140, y: 134, w: 322, h: 76};
  }

  private problemBounds(id: string): Box {
    if (id === 'agg-formula') {
      return {x: 94, y: 54, w: 236, h: 26};
    }
    if (id === 'agg-query') {
      return this.compact() ? {x: 24, y: 22, w: 424, h: 62} : {x: 400, y: 22, w: 500, h: 62};
    }
    const [kind, siteId] = id.split('-');
    const site = this.problemSites().find(s => s.id === siteId) ?? this.problemSites()[0];
    switch (kind) {
      case 'site':
        return {x: site.x + 8, y: this.SITE_Y + 4, w: 200, h: 40};
      case 'lock':
        return {x: this.downX(site) - 16, y: this.SITE_Y - 16, w: this.upX(site) - this.downX(site) + 32, h: 32};
      case 'train':
        return {x: site.x + 160, y: this.CARD_Y, w: 120, h: 176};
      case 'result':
        return {x: site.x + 304, y: this.CARD_Y, w: 120, h: 176};
      default:
        return {x: site.x + 16, y: this.CARD_Y, w: 120, h: 176};
    }
  }

  private inflate(box: Box, by: number): Box {
    return {x: box.x - by, y: box.y - by, w: box.w + 2 * by, h: box.h + 2 * by};
  }
}

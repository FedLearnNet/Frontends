import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal
} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

/** One step of a federated learning round; `n` matches the numbered badges in the figure. */
interface FlowStep {
  n: number;
  title: string;
  text: string;
  /** How long the step is shown while playing. */
  ms: number;
}

interface FlowSite {
  id: string;
  label: string;
  x: number;
  width: number;
  records: string;
  share: string;
  tone: 'violet' | 'green' | 'brown';
  /** Full sites show their three stages; the last site is drawn as a compact column. */
  full: boolean;
  /** Offset so the sites do not move in lockstep. */
  delay: number;
}

interface NetNode {
  x: number;
  y: number;
  col: number;
  kind: 'in' | 'hidden' | 'out';
}

/**
 * The federated learning round from the FL-Net figure: data stays in each hospital, the model trains
 * there, only the encrypted weight update goes to the aggregator, and the new global model comes back.
 */
@Component({
  selector: 'app-federated-flow',
  templateUrl: './federated-flow.component.html',
  styleUrl: './federated-flow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIcon],
})
export class FederatedFlowComponent {
  readonly ROUNDS = 5;
  readonly VIEW_H = 450;
  readonly AGG_BOTTOM = 90;
  readonly SITE_Y = 150;
  readonly SITE_H = 280;
  readonly CARD_Y = 212;

  readonly steps: FlowStep[] = [
    {n: 1, title: 'Data stays local', ms: 1800,
      text: 'Each hospital keeps its patient records in its own data store.'},
    {n: 2, title: 'Train locally', ms: 2400,
      text: 'The model trains on those records inside the hospital network.'},
    {n: 3, title: 'Only weights come out', ms: 1400,
      text: 'Training produces model weights, never patient records.'},
    {n: 4, title: 'Send the update, encrypted', ms: 1600,
      text: 'The weight update ΔW leaves the site over an authenticated, encrypted channel.'},
    {n: 5, title: 'Aggregate', ms: 1800,
      text: 'The global model combines all updates, weighted by each site’s patient count.'},
    {n: 6, title: 'Share the new model', ms: 1600,
      text: 'W(t+1) goes back to every site and the next round starts.'},
  ];

  readonly phase = signal(1);
  readonly round = signal(1);
  readonly playing = signal(true);
  readonly compact = signal(false);

  readonly activeStep = computed(() => this.steps[this.phase() - 1]);

  /** Users who ask for less motion get a still figure and step through it themselves. */
  readonly reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  private readonly allSites: FlowSite[] = [
    {id: '1', label: 'Site 1', x: 16, width: 440, records: '12,400', share: '14%', tone: 'violet', full: true, delay: 0},
    {id: '2', label: 'Site 2', x: 472, width: 440, records: '18,200', share: '21%', tone: 'green', full: true, delay: 150},
    {id: 'N', label: 'Site N', x: 928, width: 232, records: '', share: '…', tone: 'brown', full: false, delay: 300},
  ];

  /** On narrow screens only Site 1 is drawn, at a size that stays readable. */
  readonly sites = computed(() => this.compact() ? this.allSites.slice(0, 1) : this.allSites);
  readonly viewWidth = computed(() => this.compact() ? 472 : 1176);

  readonly roundDots = Array.from({length: this.ROUNDS}, (_, i) => i);
  readonly recordPackets = [0, 1, 2];

  readonly netNodes: NetNode[] = [
    ...[30, 54].map(y => ({x: 18, y, col: 0, kind: 'in' as const})),
    ...[16, 32, 52, 68].map(y => ({x: 44, y, col: 1, kind: 'hidden' as const})),
    ...[16, 32, 52, 68].map(y => ({x: 76, y, col: 2, kind: 'hidden' as const})),
    ...[30, 54].map(y => ({x: 102, y, col: 3, kind: 'out' as const})),
  ];
  readonly netEdges = this.netNodes.flatMap(from => this.netNodes
    .filter(to => to.col === from.col + 1)
    .map(to => ({x1: from.x, y1: from.y, x2: to.x, y2: to.y})));

  readonly weightCells = [
    '#5f6368', '#e3e3e3', '#bdbdbd', '#ececec',
    '#bdbdbd', '#9e9e9e', '#ececec', '#d0d0d0',
    '#e3e3e3', '#d0d0d0', '#5f6368', '#bdbdbd',
    '#ececec', '#bdbdbd', '#e3e3e3', '#9e9e9e',
  ].map((fill, i) => ({fill, x: 15 + (i % 4) * 24, y: 18 + Math.floor(i / 4) * 20, i}));

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setTimeout>;
  private visible = false;

  constructor() {
    if (this.reducedMotion) {
      this.playing.set(false);
    }

    afterNextRender(() => {
      const narrow = window.matchMedia('(max-width: 760px)');
      const onWidth = () => this.compact.set(narrow.matches);
      onWidth();
      narrow.addEventListener('change', onWidth);

      // The round only plays while the figure is on screen.
      const observer = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        this.schedule();
      }, {threshold: 0.25});
      observer.observe(this.host.nativeElement);

      this.destroyRef.onDestroy(() => {
        narrow.removeEventListener('change', onWidth);
        observer.disconnect();
        clearTimeout(this.timer);
      });
    });
  }

  togglePlay(): void {
    this.playing.update(playing => !playing);
    this.schedule();
  }

  /** Picking a step shows it and pauses, so it stays readable. */
  goTo(n: number): void {
    this.playing.set(false);
    this.phase.set(n);
    this.schedule();
  }

  downX(site: FlowSite): number {
    return site.full ? site.x + 220 : site.x + 130;
  }

  upX(site: FlowSite): number {
    return site.full ? site.x + 364 : site.x + 194;
  }

  /** Where the connectors meet the site: the training/result cards, or just below the header. */
  lineEnd(site: FlowSite): number {
    return site.full ? this.CARD_Y : this.SITE_Y + 40;
  }

  travel(site: FlowSite): number {
    return this.lineEnd(site) - this.AGG_BOTTOM;
  }

  private schedule(): void {
    clearTimeout(this.timer);
    if (!this.playing() || !this.visible) {
      return;
    }
    this.timer = setTimeout(() => this.advance(), this.activeStep().ms);
  }

  private advance(): void {
    const next = this.phase() % this.steps.length + 1;
    if (next === 1) {
      this.round.update(round => round % this.ROUNDS + 1);
    }
    this.phase.set(next);
    this.schedule();
  }
}

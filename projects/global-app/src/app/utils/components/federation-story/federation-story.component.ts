import {ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, signal} from '@angular/core';

export type FederationStoryMode = 'problem' | 'solution';

type SiteId = 'A' | 'B' | 'C';

interface StorySite {
  id: SiteId;
  /** Centre of the site in the SVG. */
  x: number;
  y: number;
}

interface StoryText {
  title: string;
  description: string;
  /** Short label shown on the affected hospital in the diagram. */
  badge: string;
}

/** One bottleneck of central data collection and how the federation removes it. */
interface StoryPoint {
  sites: SiteId[];
  problem: StoryText;
  solution: StoryText;
}

/**
 * Animated story of why hospital data is hard to use centrally and how federated learning gets around
 * it: five bottlenecks, each shown as a block on the hospitals it affects, then the same five solved.
 */
@Component({
  selector: 'app-federation-story',
  templateUrl: './federation-story.component.html',
  styleUrl: './federation-story.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FederationStoryComponent {
  private static readonly STEP_INTERVAL_MS = 3000;

  readonly project = input<string>('FL-Net');

  readonly mode = signal<FederationStoryMode>('problem');
  readonly activeIndex = signal(0);

  /** Users who ask for less motion get still scenes and pick the steps themselves. */
  readonly reducedMotion = typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true;

  readonly centre = {x: 300, y: 150};

  readonly sites: StorySite[] = [
    {id: 'A', x: 92, y: 62},
    {id: 'B', x: 508, y: 62},
    {id: 'C', x: 300, y: 292},
  ];

  readonly points = computed<StoryPoint[]>(() => [
    {
      sites: ['A', 'B', 'C'],
      problem: {
        title: 'Data may not leave the hospital',
        description: 'Privacy law and ethics boards stop patient data at the site.',
        badge: 'Not allowed out',
      },
      solution: {
        title: 'The model goes to the data',
        description: `${this.project()} sends the model to each site and trains it there.`,
        badge: 'Trains locally',
      },
    },
    {
      sites: ['A'],
      problem: {
        title: 'Every site stores data differently',
        description: 'CSV here, a database there: nothing fits together without manual work.',
        badge: 'Own format',
      },
      solution: {
        title: 'One shared data standard',
        description: 'Each site maps its data to the same fields once, in its local app.',
        badge: 'Shared standard',
      },
    },
    {
      sites: ['B'],
      problem: {
        title: 'Every export needs new approvals',
        description: 'Contracts and ethics votes for each question take months.',
        badge: 'Waiting for approval',
      },
      solution: {
        title: 'Approve once, reuse the setup',
        description: 'A site joins a project once and reviews each request in its local app.',
        badge: 'Approved in app',
      },
    },
    {
      sites: ['C'],
      problem: {
        title: 'Nobody knows where the right patients are',
        description: 'Finding matching data means asking every site by hand.',
        badge: 'Unknown content',
      },
      solution: {
        title: 'Search across sites',
        description: 'Find Data shows how many matching patients each site has, not who they are.',
        badge: 'Counts only',
      },
    },
    {
      sites: ['A', 'C'],
      problem: {
        title: 'A copy is out of control',
        description: 'Once data is copied elsewhere, the hospital cannot see or stop what happens with it.',
        badge: 'Copy out of control',
      },
      solution: {
        title: 'The site stays in charge',
        description: 'Every run is logged, and a site can stop taking part at any time.',
        badge: 'Logged and stoppable',
      },
    },
  ]);

  readonly active = computed(() => this.points()[this.activeIndex()]);

  private autoPlay = true;

  constructor() {
    if (this.reducedMotion) {
      return;
    }
    const timer = setInterval(() => {
      if (this.autoPlay) {
        this.activeIndex.update(index => (index + 1) % this.points().length);
      }
    }, FederationStoryComponent.STEP_INTERVAL_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  /** Picking a point stops the automatic stepping, so it stays readable. */
  select(index: number): void {
    this.autoPlay = false;
    this.activeIndex.set(index);
  }

  toggleMode(): void {
    this.mode.update(mode => mode === 'problem' ? 'solution' : 'problem');
    this.activeIndex.set(0);
    this.autoPlay = !this.reducedMotion;
  }

  isAffected(site: StorySite): boolean {
    return this.active().sites.includes(site.id);
  }

  badgeOf(point: StoryPoint): string {
    return this.mode() === 'problem' ? point.problem.badge : point.solution.badge;
  }

  pathToCentre(site: StorySite): string {
    return `M${site.x},${site.y} L${this.centre.x},${this.centre.y}`;
  }

  pathFromCentre(site: StorySite): string {
    return `M${this.centre.x},${this.centre.y} L${site.x},${site.y}`;
  }

  /** Where data sent to the centre is stopped: a bit more than half way. */
  barrier(site: StorySite): { x: number, y: number } {
    return {
      x: site.x + (this.centre.x - site.x) * 0.55,
      y: site.y + (this.centre.y - site.y) * 0.55,
    };
  }

  /** Badges sit above the top hospitals and beside the bottom one, so they never cover a line. */
  badgePosition(site: StorySite): { x: number, y: number } {
    return site.y < this.centre.y ? {x: site.x, y: site.y - 44} : {x: site.x + 118, y: site.y};
  }
}

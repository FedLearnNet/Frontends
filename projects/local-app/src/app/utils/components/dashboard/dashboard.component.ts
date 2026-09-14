import {Component, inject, signal} from '@angular/core';
import {Router} from '@angular/router';
import {environment} from '@local-app/env/environment';
import {HeroComponent} from '@shared-lib/components/hero/hero.component';
import {CapabilitiesComponent, CapabilityItem} from '@shared-lib/components/capabilities/capabilities.component';
import {
  ProblemSolutionComponent,
  ProblemSolutionStep
} from '@shared-lib/components/problem-solution/problem-solution.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    HeroComponent,
    CapabilitiesComponent,
    ProblemSolutionComponent,
  ],
})
export class DashboardComponent {
  private readonly router: Router = inject(Router);

  project = environment.project;
  appTitle = environment.appTitle;

  heroBadges = signal([
    {label: 'Data stays on-site', icon: 'shield'},
    {label: 'Standardized schema', icon: 'account_tree'},
    {label: 'Governed participation', icon: 'verified_user'},
  ]);

  heroKpis = signal([
    {label: 'Cohorts', value: 'Curated + queryable'},
    {label: 'Data ingestion', value: 'Connector-driven'},
    {label: 'Federation', value: 'Policy controlled'},
  ]);

  capabilities = signal<CapabilityItem[]>([
    {
      tag: 'Cohorts',
      icon: 'layers',
      title: 'Curate and manage cohorts',
      description: 'Define patient cohorts against a shared schema and keep them queryable for federated analyses.',
      bullets: ['Schema-validated cohorts', 'Patient-level review', 'Queryability controls'],
    },
    {
      tag: 'Ingestion',
      icon: 'cable',
      title: 'Connector-driven data ingestion',
      description: 'Map and import local source data into the standardized model through configurable connectors.',
      bullets: ['Source mapping', 'Repeatable runs', 'Rollback & audit'],
    },
    {
      tag: 'Schema',
      icon: 'account_tree',
      title: 'Standardized data schema',
      description: 'Browse the global schema and node definitions that keep data comparable across sites.',
      bullets: ['Ontology mappings', 'Typed attributes', 'Versioned nodes'],
    },
    {
      tag: 'Federation',
      icon: 'hub',
      title: 'Participate in federated training',
      description: 'Contribute to cross-site training and analytics without raw data ever leaving the clinic.',
      bullets: ['Local execution', 'Minimal transfer', 'Reproducible runs'],
    },
    {
      tag: 'Governance',
      icon: 'rule',
      title: 'Review and approve requests',
      description: 'Decide which training, statistics, and metric requests are allowed to run against your data.',
      bullets: ['Training requests', 'Statistics requests', 'Metric requests'],
    },
    {
      tag: 'Transparency',
      icon: 'description',
      title: 'Full provenance & logs',
      description: 'Every ingestion, query, and federated run produces structured, auditable records.',
      bullets: ['Run-level logs', 'Access management', 'Exportable audit trails'],
    },
  ]);

  problems = signal<ProblemSolutionStep[]>([
    {
      icon: 'storage',
      title: 'Sensitive data cannot leave the clinic',
      description: 'Governance and privacy constraints prevent centralizing patient data for analysis.',
      helper: 'This blocks large-scale collaboration and federated learning across institutions.',
    },
    {
      icon: 'sync_problem',
      title: 'Heterogeneous, non-standard data',
      description: 'Local source formats differ from site to site, breaking comparability and reproducibility.',
      helper: 'Without a shared schema, federated analyses produce inconsistent results.',
    },
    {
      icon: 'gpp_bad',
      title: 'Unclear control over participation',
      description: 'It is hard to know which external requests run against local data, and on whose authority.',
      helper: 'Missing approval workflows and provenance make participation hard to justify.',
    },
  ]);

  solutions = signal<ProblemSolutionStep[]>([
    {
      icon: 'shield',
      title: 'Keep data local, share only results',
      description: this.project + ' runs computation at the site so only approved updates or outputs are exchanged.',
      helper: 'You collaborate in federated workflows while retaining full local control of the data.',
    },
    {
      icon: 'account_tree',
      title: 'Standardize through a shared schema',
      description: 'Connectors map local sources into the global schema, making cohorts comparable across sites.',
      helper: 'Standardized, validated data makes federated runs reproducible and trustworthy.',
    },
    {
      icon: 'rule',
      title: 'Govern every request and run',
      description: 'Approve or reject training, statistics, and metric requests with complete run-level traceability.',
      helper: 'Policy-based participation and audit trails make collaboration compliant by design.',
    },
  ]);

  protected onBrowseCohorts(): void {
    this.router.navigate(['/cohort']);
  }

  protected onExploreSchema(): void {
    this.router.navigate(['/schema']);
  }

  protected onReviewRequests(): void {
    this.router.navigate(['/data-review/training']);
  }
}

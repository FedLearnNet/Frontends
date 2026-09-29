import {Component, inject, signal} from '@angular/core';
import {environment} from '@global-app/env/environment';
import {HeroComponent} from "@shared-lib/components/hero/hero.component";
import {CapabilitiesComponent, CapabilityItem} from "@shared-lib/components/capabilities/capabilities.component";
import {
  ProblemSolutionComponent,
  ProblemSolutionStep
} from "@shared-lib/components/problem-solution/problem-solution.component";
import {Router, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {BottleneckExplorerComponent} from "@global-app/utils/components/bottleneck-explorer/bottleneck-explorer.component";
import {StartHeroComponent} from "@global-app/utils/components/start-hero/start-hero.component";
import {FederatedFlowComponent} from "@global-app/utils/components/federated-flow/federated-flow.component";

interface StartAction {
  icon: string;
  title: string;
  description: string;
  route: string;
  /** Only offered where the global data standard is maintained. */
  dataModeling?: boolean;
}

interface StartStep {
  title: string;
  description: string;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    HeroComponent,
    CapabilitiesComponent,
    ProblemSolutionComponent,
    RouterLink,
    MatIcon,
    BottleneckExplorerComponent,
    FederatedFlowComponent,
    StartHeroComponent
  ]
})
export class DashboardComponent {
  private readonly router: Router = inject(Router);

  project = environment.project;
  appTitle = environment.appTitle;

  private readonly allActions: StartAction[] = [
    {icon: 'search', title: 'Find data', route: '/find-data', dataModeling: true,
      description: 'See which sites have patients that match your criteria.'},
    {icon: 'workspaces', title: 'Start a training', route: '/project',
      description: 'Train a model across sites. The data stays at each site.'},
    {icon: 'science', title: 'Analyse data', route: '/experiment',
      description: 'Run a tool on the data you have access to.'},
    {icon: 'rebase_edit', title: 'Build a workflow', route: '/workflow',
      description: 'Chain tools into a pipeline you can run again.'},
    {icon: 'inventory_2', title: 'Find a tool', route: '/store',
      description: 'Browse the tools and models in the store.'},
    {icon: 'developer_mode', title: 'Publish a tool', route: '/app',
      description: 'Turn your code into a tool others can run.'},
    {icon: 'schema', title: 'Edit the data standard', route: '/data-modelling', dataModeling: true,
      description: 'Define the fields every site maps its data to.'},
  ];

  readonly actions = this.allActions.filter(action => !action.dataModeling || environment.allowGlobalDataModeling);

  readonly steps: StartStep[] = [
    {title: 'Agree on a data standard', description: 'All sites map their data to the same fields.'},
    {title: 'Import data at each site', description: 'Each site loads its patients in its own local app.'},
    {title: 'Find matching data', description: 'Search across sites without seeing individual patients.'},
    {title: 'Train and analyse', description: 'Models travel to the data. Only results come back.'},
  ];

  get isPoSyMed(){
    return this.project.toLowerCase() === 'posymed';
  }
  heroBadges = signal([
    {label: 'Controlled tools', icon: 'verified'},
    {label: 'No-code workflows', icon: 'hub'},
    {label: 'LLM-assisted research', icon: 'smart_toy'},
  ]);

  heroKpis = signal([
    {label: 'Workflows', value: 'No-code + reproducible'},
    {label: 'Tool execution', value: 'Registry-only + governed'},
    {label: 'Assistance', value: 'LLM copilots'},
  ]);

  items = signal<CapabilityItem[]>([
    {
      tag: 'Workflows',
      icon: 'hub',
      title: 'No-code workflow composition',
      description: 'Build end-to-end biomedical pipelines by chaining tools into guided, reusable workflows.',
      bullets: ['Composable steps', 'Reusable templates', 'Typed tool I/O'],
    },
    {
      tag: 'Execution',
      icon: 'play_circle',
      title: 'Controlled tool execution',
      description: 'Run tools in a governed runtime that enforces provenance, permissions, and safe defaults.',
      bullets: ['Registry-only execution', 'Role-based access', 'Site-aware policies'],
    },
    {
      tag: 'LLM Support',
      icon: 'smart_toy',
      title: 'LLM-assisted interactions',
      description: 'Use conversational guidance to discover tools, configure inputs, and interpret results in context.',
      bullets: ['Guided configuration', 'Result explanations', 'Safer prompts & guardrails'],
    },
    {
      tag: 'Tool Development',
      icon: 'construction',
      title: 'Developer-friendly tool onboarding',
      description: 'Turn public code into validated, runnable tools with clear interfaces and repeatable releases.',
      bullets: ['Source-linked onboarding', 'Versioned interfaces', 'Template-based tool scaffolding'],
    },
    {
      tag: 'Security',
      icon: 'security',
      title: 'Risk-reduced distribution',
      description: 'Images and artifacts are validated before becoming runnable building blocks in clinical workflows.',
      bullets: ['Malware scanning', 'CVE scanning', 'Fail-fast publishing'],
    },
    {
      tag: 'Transparency',
      icon: 'history',
      title: 'Provenance & reporting',
      description: 'Every run and tool version produces structured metadata for auditability and reproducibility.',
      bullets: ['Run-level logs', 'Immutable records', 'Exportable audit trails'],
    },
  ]);

  problems = signal<ProblemSolutionStep[]>([
    {
      icon: 'extension_off',
      title: 'Fragmented tooling and workflows',
      description: 'Researchers juggle scripts, incompatible tools, and manual glue code.',
      helper: 'This slows down iteration and makes cross-team transfer of workflows difficult.',
    },
    {
      icon: 'lan',
      title: 'Hard-to-operate execution environments',
      description: 'Complex installs and heterogeneous infrastructure break reproducibility.',
      helper: 'Even small environment differences can change results and complicate validation.',
    },
    {
      icon: 'policy',
      title: 'Weak governance for clinical-grade execution',
      description: 'Unclear provenance and missing controls increase operational and compliance risk.',
      helper: 'Without enforceable policies, it’s hard to justify trust in tools and outputs.',
    },
  ]);


  solutions = signal<ProblemSolutionStep[]>([
    {
      icon: 'hub',
      title: 'No-code workflows as first-class objects',
      description: 'PoSyMed standardizes pipelines as reusable, typed workflows instead of ad-hoc scripts.',
      helper: 'Workflows become shareable assets with consistent inputs/outputs and reproducible execution.',
    },
    {
      icon: 'play_circle',
      title: 'Governed execution with registry-only artifacts',
      description: 'Tools are executed via a controlled runtime that enforces provenance and permissions.',
      helper: 'This reduces operational risk and enables consistent execution across sites and environments.',
    },
    {
      icon: 'smart_toy',
      title: 'LLM-supported configuration and interpretation',
      description: 'Conversational assistance helps users select tools, set parameters, and understand results.',
      helper: 'This lowers the barrier for non-technical users while keeping guardrails and traceability in place.',
    },
  ]);

  protected onViewDocs() {
    window.open('/documentation', '_blank');
  }

  protected onToolDevelopment() {
    this.router.navigate(['/app']);
  }

  protected onExperiment() {
    this.router.navigate(['/experiment']);

  }

  protected onProject() {
    this.router.navigate(['/project']);

  }
}

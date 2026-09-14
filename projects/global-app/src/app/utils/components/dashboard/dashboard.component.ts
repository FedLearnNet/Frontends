import {Component, inject, signal} from '@angular/core';
import {environment} from '@global-app/env/environment';
import {HeroComponent} from "@shared-lib/components/hero/hero.component";
import {CapabilitiesComponent, CapabilityItem} from "@shared-lib/components/capabilities/capabilities.component";
import {
  ProblemSolutionComponent,
  ProblemSolutionStep
} from "@shared-lib/components/problem-solution/problem-solution.component";
import {Router} from "@angular/router";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
  imports: [
    HeroComponent,
    CapabilitiesComponent,
    ProblemSolutionComponent
  ]
})
export class DashboardComponent {
  private readonly router: Router = inject(Router);

  project = environment.project;
  appTitle = environment.appTitle;

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

  flnetHeroBadges = signal([
    {label: 'Privacy-preserving federation', icon: 'shield'},
    {label: 'Cross-site orchestration', icon: 'hub'},
    {label: 'Reproducible federated runs', icon: 'repeat'}
  ]);

  flnetHeroKpis = signal([
    {label: 'Training mode', value: 'Federated + Local'},
    {label: 'Governance', value: 'Policy controlled'},
    {label: 'Deployment', value: 'Cloud / On-prem sites'}
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

  flnetCapabilities = signal<CapabilityItem[]>([
    {
      tag: 'Federation',
      icon: 'hub',
      title: 'Cross-site learning orchestration',
      description: 'Coordinate distributed training and analytics across multiple institutions without moving raw data.',
      bullets: ['Federated aggregation', 'Site coordination', 'Distributed execution'],
    },
    {
      tag: 'Privacy',
      icon: 'shield',
      title: 'Privacy-preserving execution',
      description: 'Data stays at the site while only controlled updates or results are exchanged.',
      bullets: ['Data locality', 'Minimal transfer', 'Controlled exposure'],
    },
    {
      tag: 'Governance',
      icon: 'policy',
      title: 'Policy-aware federation',
      description: 'Execution follows site-level rules and organizational constraints.',
      bullets: ['Site permissions', 'Execution policies', 'Traceable decisions'],
    },
    {
      tag: 'Workflows',
      icon: 'device_hub',
      title: 'Composable federated workflows',
      description: 'Chain analysis and training steps into reproducible cross-site pipelines.',
      bullets: ['Reusable pipelines', 'Typed interfaces', 'No-code orchestration'],
    },
    {
      tag: 'Clinical',
      icon: 'local_hospital',
      title: 'Clinical-ready collaboration',
      description: 'Built for distributed clinical environments with strong governance and auditability.',
      bullets: ['Institution isolation', 'Federated training', 'Controlled collaboration'],
    },
    {
      tag: 'Traceability',
      icon: 'history',
      title: 'End-to-end experiment tracking',
      description: 'All federated runs produce structured metadata for reproducibility and compliance.',
      bullets: ['Run metadata', 'Execution history', 'Audit-ready exports'],
    },
  ]);

  flnetProblems = signal<ProblemSolutionStep[]>([
    {
      icon: 'storage',
      title: 'Data silos across institutions',
      description: 'Clinical data cannot be centrally aggregated due to governance and privacy constraints.',
      helper: 'This limits large-scale learning and collaboration across sites.',
    },
    {
      icon: 'sync_problem',
      title: 'Inconsistent execution environments',
      description: 'Different infrastructure and local setups lead to non-reproducible experiments.',
      helper: 'Results become difficult to compare or validate across institutions.',
    },
    {
      icon: 'gpp_bad',
      title: 'Missing federation governance',
      description: 'Cross-site execution often lacks clear policy control and observability.',
      helper: 'Without centralized orchestration, tracking responsibility and compliance becomes difficult.',
    },
  ]);
  flnetSolutions = signal<ProblemSolutionStep[]>([
    {
      icon: 'hub',
      title: 'Federated orchestration layer',
      description: 'FLNet coordinates distributed execution without moving raw data.',
      helper: 'Sites participate in shared workflows while maintaining local control.',
    },
    {
      icon: 'shield',
      title: 'Privacy-preserving computation',
      description: 'Only model updates or approved outputs leave institutional boundaries.',
      helper: 'This enables collaboration while respecting governance and compliance constraints.',
    },
    {
      icon: 'policy',
      title: 'Governed and traceable federation',
      description: 'All executions follow policies with complete run-level traceability.',
      helper: 'Federated experiments become reproducible, auditable, and suitable for clinical contexts.',
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

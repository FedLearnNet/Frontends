import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {environment} from '@global-app/env/environment';
import {TranslationService} from '@shared-lib/services/translation.service';
import {RouterOutlet} from "@angular/router";
import {ToolbarComponent} from "@shared-lib/components/toolbar/toolbar.component";
import {SpinnerComponent} from "@shared-lib/components/spinner/spinner.component";
import {SidenavComponent} from "@shared-lib/components/sidenav/sidenav.component";
import {NavSection} from "@shared-lib/models/navigation";
import {FooterComponent, FooterGroup} from "@shared-lib/components/footer/footer.component";
import {AuthStateService} from "@shared-lib/services/auth-state.service";
import {MatDialog} from "@angular/material/dialog";
import {CreateIssueDialogComponent} from "@shared-lib/components/create-issue-dialog/create-issue-dialog.component";
import {getKeycloakRedirectUri} from "@shared-lib/services/keycloak";


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  imports: [
    RouterOutlet,
    ToolbarComponent,
    SpinnerComponent,
    SidenavComponent,
    FooterComponent
  ],
  standalone: true
})
export class AppComponent implements OnInit {
  private readonly translationService: TranslationService = inject(TranslationService);
  private readonly authState = inject(AuthStateService);
  private readonly dialog = inject(MatDialog);
  title = environment.appTitle;
  project = environment.project;
  allowGlobalDataModeling = environment.allowGlobalDataModeling

  menuCollapsed = signal<boolean>(false);

  private readonly baseSections: NavSection[] = [
    {
      title: 'DEVELOPMENT',
      items: [
        {label: 'MENU.PROJECT', icon: 'workspaces', route: ['/project']},
        {label: 'MENU.APP_DEVELOPMENT', icon: 'developer_mode', route: ['/app']},
        {label: 'MENU.MODEL', icon: 'model_training', route: ['/model']},
      ]
    },
    {
      title: 'STORE',
      items: [
        {label: 'MENU.STORE', icon: 'inventory_2', route: ['/store']},
        {label: 'MENU.STORE_GRAPH', icon: 'bubble_chart', route: ['/tool-graph']},
        {label: 'MENU.STORE_AUDIT', icon: 'fact_check', route: ['/tool-audit']},
      ]
    },
    {
      title: 'MENU.DATA_SCIENCE',
      items: [
        {label: 'MENU.FIND_DATA', icon: 'search', route: ['/find-data']},
        {label: 'MENU.WORKFLOW', icon: 'rebase_edit', route: ['/workflow']},
        {
          label: 'MENU.DATA_MODELLING', icon: 'schema', route: ['/data-modelling'],
          children: [
            {label: 'MENU.ONTOLOGY', icon: 'account_tree', route: ['/data-modelling/ontology']},
            {label: 'MENU.SCHEMA', icon: 'hub', route: ['/data-modelling/schema']},
            {label: 'MENU.DATA_TYPES', icon: 'data_object', route: ['/data-modelling/data-types']},
            {label: 'MENU.DATA_GENERATION', icon: 'auto_awesome', route: ['/data-modelling/data']}
          ]
        },
        {label: 'MENU.EXPERIMENTS', icon: 'science', route: ['/experiment']},
        {label: 'MENU.MY_FILES', icon: 'folder_open', route: ['/files']},
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        {label: 'MENU.ADMIN', icon: 'admin_panel_settings', route: ['/admin']},
      ]
    }
  ];

  private readonly baseSectionsPosyMed: NavSection[] = [
    {
      title: 'DEVELOPMENT',
      items: [
        {label: 'MENU.APP_DEVELOPMENT', icon: 'developer_mode', route: ['/app']},
        {label: 'MENU.MODEL', icon: 'model_training', route: ['/model']},
      ]
    },
    {
      title: 'STORE',
      items: [
        {label: 'MENU.STORE', icon: 'inventory_2', route: ['/store']},
        {label: 'MENU.STORE_GRAPH', icon: 'bubble_chart', route: ['/tool-graph']},
        {label: 'MENU.STORE_AUDIT', icon: 'fact_check', route: ['/tool-audit']},
      ]
    },
    {
      title: 'MENU.DATA_SCIENCE',
      items: [
        {label: 'MENU.WORKFLOW', icon: 'rebase_edit', route: ['/workflow']},
        {label: 'MENU.EXPERIMENTS', icon: 'science', route: ['/experiment']},
        {label: 'MENU.MY_FILES', icon: 'folder_open', route: ['/files']},
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        {label: 'MENU.ADMIN', icon: 'admin_panel_settings', route: ['/admin']},
      ]
    }
  ];

  private readonly baseMenuItems = [
    {key: 'FIND_DATA', link: '/find-data'},
    {key: 'PROJECT', link: '/project'},
    {key: 'APP_DEVELOPMENT', link: '/app'},
    {key: 'EXPERIMENTS', link: '/experiment'},
    {key: 'ADMIN', link: '/admin'}
  ];

  private readonly baseMenuPosyMed = [
    {key: 'APP_DEVELOPMENT', link: '/app'},
    {key: 'EXPERIMENTS', link: '/experiment'},
    {key: 'ADMIN', link: '/admin'}
  ];

  readonly sections = computed(() => this.filterSections(this.baseSections));
  readonly sectionsPosyMed = computed(() => this.filterSections(this.baseSectionsPosyMed));
  readonly menuItems = computed(() => this.filterAdminMenu(this.baseMenuItems));
  readonly menuPosyMed = computed(() => this.filterAdminMenu(this.baseMenuPosyMed));

  groups = signal<FooterGroup[]>([
    {
      title: 'Developers',
      links: [
        {label: 'Documentation', href: getKeycloakRedirectUri('documentation/')},
        {label: 'Report an Issue', action: () => this.dialog.open(CreateIssueDialogComponent, {width: '600px'})},
      ],
    },
    {
      title: 'About FL-Net',
      links: [
        {label: 'About', href: 'https://www.cosy.bio/'},
        {label: 'Contact', href: 'https://www.cosy.bio/contact'},
        {label: 'Imprint', href: 'https://www.cosy.bio/contact'},
      ],
    },
  ]);


  ngOnInit() {
    document.title = environment.appTitle;

    this.translationService.initLanguage();
    this.translationService.switchLanguage('en');
  }

  onToggle() {
    this.menuCollapsed.update(v => !v);
  }


  private filterAdminMenu<T extends { key: string }>(items: T[]): T[] {
    if (this.authState.isAdmin()) {
      return items;
    }

    return items.filter(item => item.key !== 'ADMIN');
  }

  private filterSections(sections: NavSection[]): NavSection[] {
    sections = this.filterAdminSections(sections);
    sections = this.filterAuditorSections(sections);
    return sections;
  }

  private filterAdminSections(sections: NavSection[]): NavSection[] {
    if (this.authState.isAdmin()) {
      return sections;
    }

    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.label !== 'MENU.ADMIN')
      }))
      .filter(section => section.items.length > 0);
  }

  private filterAuditorSections(sections: NavSection[]): NavSection[] {
    if (this.authState.isAuditor()) {
      return sections;
    }

    return sections
      .map(section => ({
        ...section,
        items: section.items.filter(item => item.label !== 'MENU.STORE_AUDIT')
      }))
      .filter(section => section.items.length > 0);
  }
}

import {Component, input} from '@angular/core';
import {RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {getKeycloakRedirectUri} from "@shared-lib/services/keycloak";

export interface FooterLink {
  label: string;
  href?: string;
  routerLink?: string;
  action?: () => void;
}

export interface FooterGroup {
  title: string;
  links: FooterLink[];
}

@Component({
  selector: 'app-lib-footer',
  imports: [
    RouterLink,
    MatIcon
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  year = new Date().getFullYear();
  documentationHref = getKeycloakRedirectUri('documentation/');
  brand = input<string>('PoSyMed');
  tagline = input<string>('Clinical-grade tooling platform');

  groups = input<FooterGroup[]>([]);

  copyright = input<string>(`All rights reserved.`);
  githubLabel = input<string | null>('Source / SDK');
  docsLabel = input<string | null>('Documentation');

}

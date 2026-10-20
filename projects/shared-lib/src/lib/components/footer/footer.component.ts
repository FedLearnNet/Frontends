import {Component, input, ChangeDetectionStrategy} from '@angular/core';
import {RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {getAppUrl} from "@shared-lib/utils/url.helper";
import {SkeletonLineComponent} from "@shared-lib/components/skeleton-line/skeleton-line.component";

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
    MatIcon,
    SkeletonLineComponent
  ],
  templateUrl: './footer.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  year = new Date().getFullYear();
  documentationHref = getAppUrl('documentation/');
  brand = input<string>('PoSyMed');
  tagline = input<string>('Clinical-grade tooling platform');

  groups = input<FooterGroup[]>([]);

  copyright = input<string>(`All rights reserved.`);
  githubLabel = input<string | null>('Source / SDK');
  docsLabel = input<string | null>('Documentation');
  version = input<string | null>(null);
  versionLoading = input<boolean>(false);
  versionHint = input<string | null>(null);

}

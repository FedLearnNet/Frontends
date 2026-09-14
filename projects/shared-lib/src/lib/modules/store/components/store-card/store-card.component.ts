import {ChangeDetectionStrategy, Component, computed, HostBinding, HostListener, input, output} from '@angular/core';
import {StoreDTO} from "@shared-lib/modules/store/dto/store";
import {MatCard, MatCardFooter} from "@angular/material/card";
import {PlaceholderImageComponent} from "@shared-lib/components/placeholder-image/placeholder-image.component";
import {RouterLink} from "@angular/router";
import {AppCardTagsComponent} from "@shared-lib/modules/store/components/app-card-tags/app-card-tags.component";
import {NgTemplateOutlet} from "@angular/common";
import {AppDto} from "@shared-lib/modules/store/dto/app";
import {animate, state, style, transition, trigger} from "@angular/animations";
import {AppTypeBadgeComponent} from "@shared-lib/modules/store/components/app-type-badge/app-type-badge.component";
import {StoreRatingComponent} from "@shared-lib/modules/store/components/store-rating/store-rating.component";
import {TranslatePipe} from "@ngx-translate/core";
import {MatButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatDivider} from "@angular/material/divider";
import {DockerImageTagComponent} from "@shared-lib/components/docker-image-tag/docker-image-tag.component";

interface StoreCardData {
  isModel: boolean;
  isWorkflow: boolean;
  name: string;
  icon?: string;
  shortDescription: string;
  rating: number;
  image: string;
  app?: AppDto,
}

export type StoreCardSize = 'x-small' | 'small' | 'medium' | 'large' | 'x-large';

@Component({
  selector: 'lib-store-card',
  imports: [
    MatCard,
    MatCardFooter,
    PlaceholderImageComponent,
    RouterLink,
    AppCardTagsComponent,
    NgTemplateOutlet,
    AppTypeBadgeComponent,
    StoreRatingComponent,
    TranslatePipe,
    MatButton,
    MatIcon,
    MatDivider,
    DockerImageTagComponent,
  ],
  templateUrl: './store-card.component.html',
  styleUrl: './store-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('cardHover', [
      state('normal', style({transform: 'translateY(0)', boxShadow: 'var(--shadow-elevation-medium)'})),
      state('hovered', style({transform: 'translateY(-6px)', boxShadow: 'var(--shadow-elevation-high)'})),
      transition('normal <=> hovered', animate('300ms cubic-bezier(0.25, 0.8, 0.25, 1)')),
    ]),
  ],
})
export class StoreCardComponent {
  storeElement = input.required<StoreDTO>();
  linkToShop = input.required<boolean>();
  enableHover = input<boolean>(true);
  border = input<boolean>(true);
  size = input<StoreCardSize>('medium');

  itemClicked = output<StoreDTO>();

  animationState: 'normal' | 'hovered' = 'normal';

  @HostListener('mouseenter') onMouseEnter() {
    if (!this.enableHover()) {
      return;
    }
    this.animationState = 'hovered';
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.animationState = 'normal';
  }

  @HostBinding('class')
  get hostClasses() {
    return `shop-card-size-${this.size()}`;
  }

  readonly routerLink = computed(() => {
    if (!this.linkToShop()) {
      return null;
    }
    const el = this.storeElement();
    if (el.workflow) {
      return ['/workflow', el.workflow.id];
    }
    return el.model ? ['model', el.model.id] : [el.app!.id];
  });

  readonly appLink = computed(() => {
    const el = this.storeElement();
    return ['/store/', el.app!.id];
  });

  readonly displayData = computed(() => {
    const el = this.storeElement();
    if (el.workflow != null) {
      const workflow = el.workflow;
      return {
        isModel: false,
        isWorkflow: true,
        name: workflow.name ?? "Loading",
        icon: undefined,
        shortDescription: workflow.description,
        app: undefined,
        rating: 0,
        image: "null",
      } as StoreCardData;
    }
    const isModel = !!el.model;
    const name = el.model?.name ?? el.app?.name;
    return {
      isModel,
      isWorkflow: false,
      name: name ?? "Loading",
      icon: isModel ? el.model!.federatedApp.icon : el.app!.icon,
      shortDescription: el.model?.shortDescription ?? el.app!.shortDescription,
      app: isModel ? el.model!.federatedApp : el.app,
      rating: el.app!.average,
      image: isModel ? "TODO" : el.app?.imageName
    } as StoreCardData;
  });

  public itemClick() {
    if (this.linkToShop()) {
      return;
    }
    this.itemClicked.emit(this.storeElement());
  }
}

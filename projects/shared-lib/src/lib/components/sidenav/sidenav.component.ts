import {ChangeDetectionStrategy, Component, computed, HostBinding, input, model, output, signal} from '@angular/core';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatDividerModule} from '@angular/material/divider';
import {LayoutModule} from '@angular/cdk/layout';
import {RouterLink, RouterLinkActive} from "@angular/router";
import {NavItem, NavSection} from "@shared-lib/models/navigation";
import {TranslatePipe} from "@ngx-translate/core";
import {UpperCasePipe} from "@angular/common";

@Component({
  selector: 'lib-sidenav',
  imports: [
    LayoutModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
    MatTooltipModule,
    MatDividerModule,
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    UpperCasePipe,
  ],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidenavComponent {
  sections = input<NavSection[]>([]);
  title = input<string>('Title');
  starredIds = input<readonly string[]>([]);

  collapsed = model<boolean>(false);
  starToggle = output<NavItem>();

  selectedItemKey = signal<string | undefined>(undefined);
  activeItemKey = signal<string | undefined>(undefined);
  openItemKeys = signal<Set<string>>(new Set());

  initials = computed(() => {
    return this.title()?.slice(0, 2)?.toUpperCase() || '';
  })
  @HostBinding('class.is-collapsed')
  get isCollapsedHost() {
    return this.collapsed();
  }

  onToggle() {
    this.collapsed.update(v => !v);
  }

  onItemClick(item: NavItem) {
    if (item.disabled) return;
    const key = this.itemKey(item);
    this.selectedItemKey.set(key);
    if (item.children?.length) {
      this.openItemKeys.update(keys => {
        const next = new Set(keys);
        next.add(key);
        return next;
      });
    }
  }

  isSelected(item: NavItem) {
    return this.selectedItemKey() === this.itemKey(item);
  }

  setIsActive(item: NavItem, isActive: boolean) {
    const key = this.itemKey(item);
    if (!isActive) {
      if (this.activeItemKey() === key) {
        this.activeItemKey.set(undefined);
      }
      return;
    }
    this.activeItemKey.set(key);

  }

  isActive(item: NavItem) {
    return this.activeItemKey() === this.itemKey(item);
  }

  isOpen(item: NavItem) {
    return this.openItemKeys().has(this.itemKey(item)) || this.isSelected(item) || this.isActive(item);
  }

  onChildItemClick(parent: NavItem, item: NavItem) {
    if (item.disabled) return;
    this.openItemKeys.update(keys => {
      const next = new Set(keys);
      next.add(this.itemKey(parent));
      return next;
    });
    this.selectedItemKey.set(this.itemKey(item));
  }

  isStarred(item: NavItem): boolean {
    return !!item.id && this.starredIds().includes(item.id);
  }

  onStarClick(event: Event, item: NavItem) {
    event.preventDefault();
    event.stopPropagation();
    this.starToggle.emit(item);
  }

  itemKey(item: NavItem): string {
    return item.id ?? item.label;
  }
}

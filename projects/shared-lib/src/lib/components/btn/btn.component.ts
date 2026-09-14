import {Component, computed, input, output} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {MatMenuModule} from '@angular/material/menu';
import type {MatMenuPanel} from '@angular/material/menu';
import {TranslatePipe} from '@ngx-translate/core';

export type BtnType =
  | 'ADD' | 'CREATE' | 'SAVE' | 'UPDATE' | 'EDIT'
  | 'DELETE' | 'REMOVE'
  | 'CANCEL' | 'CLOSE' | 'BACK'
  | 'RUN' | 'START' | 'STOP'
  | 'SEND' | 'SUBMIT' | 'PUBLISH'
  | 'IMPORT' | 'DOWNLOAD' | 'EXPORT' | 'SHARE'
  | 'CONTINUE' | 'NEXT'
  | 'CUSTOM';

export type BtnVariant = 'PRIMARY' | 'SECONDARY' | 'GHOST' | 'DANGER' | 'RAISED';
export type BtnSize = 'SMALL' | 'MEDIUM' | 'LARGE';
export type BtnAppearance = 'DEFAULT' | 'FAB_EXTENDED';
export type BtnColorVariant = 'BLUE' | 'PINK';

const DEFAULT_ICONS: Partial<Record<BtnType, string>> = {
  ADD: 'add',
  CREATE: 'add_circle',
  SAVE: 'save',
  UPDATE: 'edit',
  EDIT: 'edit',
  DELETE: 'delete',
  REMOVE: 'remove_circle',
  CANCEL: 'close',
  CLOSE: 'close',
  BACK: 'arrow_back',
  RUN: 'play_arrow',
  START: 'play_arrow',
  STOP: 'stop',
  SEND: 'send',
  SUBMIT: 'check',
  PUBLISH: 'publish',
  IMPORT: 'upload',
  DOWNLOAD: 'download',
  EXPORT: 'download',
  SHARE: 'share',
  CONTINUE: 'arrow_forward',
  NEXT: 'chevron_right',
};

const DEFAULT_LABEL_KEYS: Partial<Record<BtnType, string>> = {
  ADD: 'BUTTON.ADD_NEW',
  CREATE: 'BUTTON.CREATE',
  SAVE: 'BUTTON.SAVE',
  UPDATE: 'BUTTON.UPDATE',
  EDIT: 'BUTTON.EDIT',
  DELETE: 'BUTTON.DELETE',
  REMOVE: 'BUTTON.DELETE',
  CANCEL: 'BUTTON.CANCEL',
  CLOSE: 'BUTTON.CLOSE',
  BACK: 'BUTTON.BACK',
  RUN: 'BUTTON.RUN',
  START: 'BUTTON.RUN',
  STOP: 'BUTTON.STOP',
  SEND: 'BUTTON.SUBMIT',
  SUBMIT: 'BUTTON.SUBMIT',
  PUBLISH: 'BUTTON.PUBLISH',
  IMPORT: 'BUTTON.IMPORT',
  DOWNLOAD: 'BUTTON.DOWNLOAD',
  EXPORT: 'BUTTON.EXPORT',
  SHARE: 'BUTTON.SHARE',
  CONTINUE: 'BUTTON.CONTINUE',
  NEXT: 'BUTTON.Next',
};

const DEFAULT_VARIANTS: Partial<Record<BtnType, BtnVariant>> = {
  DELETE: 'DANGER',
  REMOVE: 'DANGER',
  CANCEL: 'GHOST',
  CLOSE: 'GHOST',
  BACK: 'GHOST',
  STOP: 'SECONDARY',
  CREATE: 'SECONDARY',
};

@Component({
  selector: 'lib-btn',
  imports: [MatButtonModule, MatIcon, MatMenuModule, TranslatePipe],
  templateUrl: './btn.component.html',
  styleUrl: './btn.component.scss',
  host: {'[class.full-width]': 'fullWidth()'},
})
export class BtnComponent {
  type = input<BtnType>('CUSTOM');
  variant = input<BtnVariant>();
  size = input<BtnSize>('MEDIUM');
  label = input<string>();
  icon = input<string>();
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  iconOnly = input<boolean>(false);
  fullWidth = input<boolean>(false);
  btnType = input<'button' | 'submit' | 'reset'>('button');
  appearance = input<BtnAppearance>('DEFAULT');
  colorVariant = input<BtnColorVariant>('BLUE');
  ariaLabel = input<string>();
  menuTriggerFor = input<MatMenuPanel | null>(null);
  menuIcon = input<string>('expand_more');
  menuAriaLabel = input<string>('Open more actions');

  clicked = output<void>();

  resolvedIcon = computed(() => this.icon() ?? DEFAULT_ICONS[this.type()] ?? null);
  resolvedVariant = computed(() => this.variant() ?? DEFAULT_VARIANTS[this.type()] ?? 'PRIMARY');
  defaultLabelKey = computed(() => DEFAULT_LABEL_KEYS[this.type()] ?? '');
  isDisabled = computed(() => this.disabled() || this.loading());
  hasMenu = computed(() => this.appearance() === 'DEFAULT' && !!this.menuTriggerFor());

  className = computed(() =>
    ['btn', this.size().toLowerCase(), this.resolvedVariant().toLowerCase(),
      this.loading() ? 'loading' : '',
      this.iconOnly() ? 'icon-only' : '',
      this.hasMenu() ? 'split-main' : '',
    ].filter(Boolean).join(' ')
  );

  menuClassName = computed(() =>
    ['btn', this.size().toLowerCase(), this.resolvedVariant().toLowerCase(), 'icon-only', 'split-menu',
      this.loading() ? 'loading' : '',
    ].filter(Boolean).join(' ')
  );

  splitClassName = computed(() =>
    ['btn-split', this.size().toLowerCase(), this.resolvedVariant().toLowerCase()]
      .filter(Boolean).join(' ')
  );

  fabClassName = computed(() =>
    ['btn-fab-extended', this.size().toLowerCase(), this.colorVariant().toLowerCase(),
      this.loading() ? 'loading' : '',
    ].filter(Boolean).join(' ')
  );

  onButtonClick(): void {
    if (!this.isDisabled()) this.clicked.emit();
  }
}

import {ChangeDetectionStrategy, Component, computed, input, model} from '@angular/core';
import {environment} from '@shared-lib/env/environment';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatButtonModule} from "@angular/material/button";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {TranslatePipe} from "@ngx-translate/core";
import {UserMenuComponent} from "@shared-lib/components/user-menu/user-menu.component";
import {MatIcon} from "@angular/material/icon";
import {toSignal} from '@angular/core/rxjs-interop';
import {fromEvent, map, startWith} from 'rxjs';

@Component({
  selector: 'app-lib-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.scss',
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, RouterLink, RouterLinkActive, TranslatePipe, UserMenuComponent, MatIcon],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent {
  collapsed = model<boolean>(false);
  menuItems = input<any>();
  project = environment.project;
  title = environment.appTitle;

  readonly isMobile = toSignal(
    fromEvent(window, 'resize').pipe(
      startWith(null),
      map(() => window.innerWidth <= 768)
    ),
    {initialValue: window.innerWidth <= 768}
  );

  collapseToggle() {
    this.collapsed.update(c => !c);
  }

  readonly showLabel = computed(() => this.project !== this.title);


}

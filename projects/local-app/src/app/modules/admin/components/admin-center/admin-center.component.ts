import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {FormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {environment} from "@local-app/env/environment";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {finalize, startWith} from 'rxjs';
import {
  AdminCenterComponent as SharedAdminCenterComponent,
  AdminCenterTile,
} from "@shared-lib/modules/admin/components/admin-center/admin-center.component";
import {HeaderComponent} from '@shared-lib/components/header/header.component';
import {PageWrapperComponent} from '@shared-lib/components/page-wrapper/page-wrapper.component';
import {BadgeColor, BadgeComponent} from '@shared-lib/components/badge/badge.component';
import {KvComponent} from '@shared-lib/components/kv/kv.component';
import {GlobalAuthService} from '../../service/global-auth.service';
import {LocalApiHealthService} from '../../service/health.service';
import {UpDownUnknown} from '../../dto/health';


@Component({
  selector: 'app-admin-center',
  imports: [
    BadgeComponent,
    HeaderComponent,
    KvComponent,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    PageWrapperComponent,
    ReactiveFormsModule,
    SharedAdminCenterComponent
  ],
  templateUrl: './admin-center.component.html',
  styleUrl: './admin-center.component.scss'
})
export class AdminCenterComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly globalAuthService = inject(GlobalAuthService);
  private readonly healthService = inject(LocalApiHealthService);

  keycloakUrl = environment.keycloak.url || '';

  readonly isLoadingGlobalAuth = signal(false);
  readonly isSubmittingLogin = signal(false);
  readonly globalAuthError = signal<string | null>(null);
  readonly websocketStatus = signal<UpDownUnknown>('UNKNOWN');
  readonly tokenStatus = signal<'UNKNOWN' | 'OK' | 'FAILED'>('UNKNOWN');
  readonly runtimeLoginActive = signal(false);

  readonly globalAuthForm = this.formBuilder.nonNullable.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });
  private readonly globalAuthFormValue = toSignal(
    this.globalAuthForm.valueChanges.pipe(startWith(this.globalAuthForm.getRawValue())),
    {initialValue: this.globalAuthForm.getRawValue()}
  );

  readonly credentialsState = computed(() => {
    const value = this.globalAuthFormValue();
    return value.username?.trim() && value.password?.trim() ? 'READY' : 'NEEDED';
  });

  readonly credentialsBadgeText = computed(() =>
    this.credentialsState() === 'READY' ? 'Credentials entered' : 'Username/password needed'
  );

  readonly credentialsBadgeColor = computed<BadgeColor>(() =>
    this.credentialsState() === 'READY' ? 'BLUE' : 'ORANGE'
  );

  readonly tokenBadgeText = computed(() => {
    switch (this.tokenStatus()) {
      case 'OK':
        return 'User token works';
      case 'FAILED':
        return 'Token check failed';
      default:
        return 'Token not checked';
    }
  });

  readonly tokenBadgeColor = computed<BadgeColor>(() => {
    switch (this.tokenStatus()) {
      case 'OK':
        return 'GREEN';
      case 'FAILED':
        return 'RED';
      default:
        return 'GRAY';
    }
  });

  readonly websocketBadgeText = computed(() =>
    this.websocketStatus() === 'UP' ? 'WebSocket connected' :
      this.websocketStatus() === 'DOWN' ? 'WebSocket disconnected' : 'WebSocket unknown'
  );

  readonly websocketBadgeColor = computed<BadgeColor>(() =>
    this.websocketStatus() === 'UP' ? 'GREEN' :
      this.websocketStatus() === 'DOWN' ? 'RED' : 'GRAY'
  );

  tiles = signal<AdminCenterTile[]>([
    {
      id: 'docker',
      title: 'Docker & Orchestration',
      description: 'Show containers, images (TODO), volumes and deployments (TODO).',
      icon: 'hub',
      routerLink: '/admin/orch'
    },
    {
      id: 'health',
      title: 'Health',
      description: 'Service health checks',
      icon: 'monitor_heart',
      routerLink: '/admin/health'
    },
    // Add more tiles here as your sub-dashboards grow
    // { id: 'users', title: 'Users', description: 'User provisioning', icon: 'group', routerLink: '/admin/users' },
  ]);

  ngOnInit(): void {
    this.refreshGlobalAuthStatus();
  }

  refreshGlobalAuthStatus(): void {
    this.isLoadingGlobalAuth.set(true);
    this.globalAuthError.set(null);

    this.healthService.streamBoxes().pipe(
      finalize(() => this.isLoadingGlobalAuth.set(false)),
    ).subscribe({
      next: boxes => {
        const apiBox = boxes.find(box => box.key === 'api');
        this.websocketStatus.set(
          apiBox?.items.find(item => item.label === 'WebSocket connected')?.status ?? 'UNKNOWN'
        );
      },
      error: error => {
        this.globalAuthError.set(error?.error ?? error?.message ?? 'Failed to load global service status');
        this.websocketStatus.set('UNKNOWN');
      },
    });
  }

  loginToGlobal(): void {
    this.globalAuthForm.markAllAsTouched();
    if (this.globalAuthForm.invalid) {
      this.tokenStatus.set('UNKNOWN');
      return;
    }

    this.isSubmittingLogin.set(true);
    this.globalAuthError.set(null);
    this.globalAuthService.login(this.globalAuthForm.getRawValue()).pipe(
      finalize(() => this.isSubmittingLogin.set(false)),
    ).subscribe({
      next: () => {
        this.runtimeLoginActive.set(true);
        this.tokenStatus.set('OK');
        this.globalAuthForm.controls.password.reset('');
        this.refreshGlobalAuthStatus();
      },
      error: error => {
        this.runtimeLoginActive.set(false);
        this.tokenStatus.set('FAILED');
        this.globalAuthError.set(error?.error ?? error?.message ?? 'Global login failed');
      },
    });
  }

  clearGlobalLogin(): void {
    this.isSubmittingLogin.set(true);
    this.globalAuthError.set(null);
    this.globalAuthService.clearLogin().pipe(
      finalize(() => this.isSubmittingLogin.set(false)),
    ).subscribe({
      next: () => {
        this.runtimeLoginActive.set(false);
        this.tokenStatus.set('UNKNOWN');
        this.globalAuthForm.reset();
        this.refreshGlobalAuthStatus();
      },
      error: error => {
        this.globalAuthError.set(error?.error ?? error?.message ?? 'Failed to clear global login');
      },
    });
  }

}

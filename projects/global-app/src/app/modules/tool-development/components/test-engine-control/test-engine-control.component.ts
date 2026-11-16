import {ChangeDetectionStrategy, Component, computed, inject, input, OnDestroy, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatTooltip} from "@angular/material/tooltip";
import {Store} from "@ngrx/store";
import {AppDetailDto} from "@shared-lib/modules/store/dto/app-detail";
import {BadgeComponent} from "@shared-lib/components/badge/badge.component";
import {engineAttemptOf, TestEngineMode} from "../../dto/test-engine";
import {RunStatusTypes} from "../../dto/test-run";
import * as TestEngineActions from "../../store/test-engine.actions";
import {selectConnectingTestEngine, selectTestEngineStarting} from "../../store/test-engine.selectors";

@Component({
  selector: 'app-test-engine-control',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatTooltip,
    BadgeComponent,
  ],
  templateUrl: './test-engine-control.component.html',
  styleUrl: './test-engine-control.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestEngineControlComponent implements OnInit, OnDestroy {
  private readonly store = inject(Store);

  readonly app = input.required<AppDetailDto>();
  readonly appConnected = input<boolean>(false);

  readonly engine = this.store.selectSignal(selectConnectingTestEngine);
  readonly busy = this.store.selectSignal(selectTestEngineStarting);

  readonly running = computed(() => {
    const engine = this.engine();
    return !!engine && engineAttemptOf(engine)?.status === RunStatusTypes.RUNNING;
  });
  readonly canStart = computed(() => !!this.app().hasImage && !this.appConnected() && !this.busy());
  readonly startHint = computed(() => {
    if (!this.app().hasImage) return 'The latest version has no image yet';
    if (this.appConnected()) return 'A local engine is connected; stop it to use the built version';
    return 'Starts the built image on the platform; test runs, experiments and federated test runs then use it';
  });

  ngOnInit(): void {
    this.store.dispatch(TestEngineActions.loadTestEngines({appId: this.app().id}));
  }

  ngOnDestroy(): void {
    this.store.dispatch(TestEngineActions.stopTestEngineStream());
  }

  start(): void {
    this.store.dispatch(TestEngineActions.startTestEngine({appId: this.app().id, create: {mode: TestEngineMode.ENGINE}}));
  }

  stop(): void {
    const engine = this.engine();
    if (engine) {
      this.store.dispatch(TestEngineActions.stopTestEngine({appId: this.app().id, id: engine.id}));
    }
  }
}

import {InjectionToken} from "@angular/core";
import {Observable} from "rxjs";
import {BasePipelineDTO} from "@shared-lib/modules/pipeline/dto/pipeline";

// Starts a vulnerability rescan of a tool version and streams its pipeline; only the global app provides it
export type PipelineRescan = (appVersionId: number) => Observable<BasePipelineDTO>;

export const PIPELINE_RESCAN = new InjectionToken<PipelineRescan>('PIPELINE_RESCAN');

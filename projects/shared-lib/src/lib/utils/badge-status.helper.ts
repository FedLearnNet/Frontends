import {ProjectStatus} from "@global-app/project/dto/project";
import {StatusBadeType} from "@shared-lib/components/status-badge/status-badge.component";
import {RunStatusTypes} from "../../../../global-app/src/app/modules/tool-development/dto/test-run";
import {PipelineStatus} from "../../../../global-app/src/app/modules/pipeline/dto/pipeline";
import {ModelSubStatus} from "@global-app/model-store/dto/model-status";
import {PublishStatus} from "@shared-lib/modules/store/dto/enum";
import {PublishBadeType} from "@shared-lib/components/publish-badge/publish-badge.component";


export function dockerStatusToBadgeStatus(status?: string): StatusBadeType {
  status = status?.toUpperCase() ?? 'UNKNOWN';

  if (status.includes('RUNNING') || status.includes('UP') || status.includes('HEALTHY') || status === 'FINISHED') {
    return 'SUCCESS';
  }
  if (status.includes('PAUSED') || status.includes('CREATED') || status.includes('STARTING')) {
    return 'WARNING';
  }
  if (status.includes('FAILED') || status.includes('ERROR') || status.includes('KILLED')) {
    return 'FAILED';
  }
  return 'INIT';
}


export function projectStatusToBadgeStatus(projectStatus: ProjectStatus): StatusBadeType {
  switch (projectStatus) {
    case ProjectStatus.FINISHED:
      return 'SUCCESS';
    case ProjectStatus.ERROR:
      return 'FAILED';
    case ProjectStatus.RUNNING:
    case ProjectStatus.SHUTDOWN:
      return 'RUNNING';
    case ProjectStatus.PREPARE:
    case ProjectStatus.READY:
      return 'PENDING';
    case ProjectStatus.STOPPED:
      return 'WARNING';
    case ProjectStatus.INIT:
    default:
      return 'INIT';
  }
}

export function runStatusToBadgeStatus(status: RunStatusTypes): StatusBadeType {
  if (status === undefined || status == null) {
    return 'INIT';
  }
  switch (status.toUpperCase()) {
    case RunStatusTypes.FINISHED:
      return 'SUCCESS';
    case RunStatusTypes.ERROR:
      return 'FAILED';
    case RunStatusTypes.STOPPED:
      return 'WARNING';
    case RunStatusTypes.STARTED:
    case RunStatusTypes.RUNNING:
      return 'RUNNING';
    case RunStatusTypes.PENDING:
      return 'PENDING';
    case RunStatusTypes.INITIALIZED:
    default:
      return 'INIT';
  }
}

export function pipelineStatusToBadgeStatus(status: PipelineStatus): StatusBadeType {
  switch (status) {
    case PipelineStatus.SUCCESS:
      return 'SUCCESS';
    case PipelineStatus.FAILED:
      return 'FAILED';
    case PipelineStatus.RUNNING:
      return 'RUNNING';
    case PipelineStatus.PENDING:
      return 'PENDING';
    case PipelineStatus.WARNING:
      return 'WARNING';
    case PipelineStatus.STOPPED:
      return 'STOPPED';
  }
}

export function modelSubStatusToBadgeStatus(status: ModelSubStatus): StatusBadeType {
  switch (status) {
    case ModelSubStatus.TRAINED:
      return 'SUCCESS';
    case ModelSubStatus.TRAINING:
      return 'RUNNING';
    case ModelSubStatus.INITIALIZED:
      return 'INIT';
  }
}

export function publishToBadgeStatus(status: PublishStatus): PublishBadeType {
  switch (status) {
    case PublishStatus.PUBLISHED:
      return 'PUBLISHED';
    case PublishStatus.UNPUBLISHED:
      return 'PRIVATE';
  }
}

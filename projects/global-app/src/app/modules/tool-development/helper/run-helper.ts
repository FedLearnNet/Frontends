import {RunStatusTypes} from "../dto/test-run";
import {DataAnalysisPredictionDTO} from "@shared-lib/modules/app-execution/dto/prediction";

export function isFinished(state?: RunStatusTypes) {
  if (!state) {
    return false;
  }
  return state === RunStatusTypes.FINISHED || state === RunStatusTypes.STOPPED || state === RunStatusTypes.ERROR;
}

export function isNotFinished(state: RunStatusTypes) {
  return state !== RunStatusTypes.FINISHED && state !== RunStatusTypes.STOPPED && state !== RunStatusTypes.ERROR;
}

export function hasMoreSteps(prediction: DataAnalysisPredictionDTO) {
  const currentStep = prediction.currentWorkflowStep ?? 0;
  const maxSteps = prediction.maxWorkflowSteps ?? 0;
  return currentStep !== maxSteps;
}

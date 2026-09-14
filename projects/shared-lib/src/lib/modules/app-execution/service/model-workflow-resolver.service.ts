import {ActivatedRouteSnapshot, ResolveFn} from "@angular/router";
import {inject} from "@angular/core";
import {Store} from "@ngrx/store";
import {DataAnalysisActions} from "@shared-lib/modules/app-execution/store/data-analysis/data-analysis.actions";

export const modelWorkflowsResolver: ResolveFn<void> = () => {
  inject(Store).dispatch(DataAnalysisActions.loadDataAnalyses());
}

export const modelWorkflowResolver: ResolveFn<boolean> = (route: ActivatedRouteSnapshot) => {
  const store = inject(Store);
  const modelWorkflowId = route.paramMap.get('workflow-id');
  if (!modelWorkflowId) {
    return false;
  }
  store.dispatch(DataAnalysisActions.loadDataAnalysis({id: +modelWorkflowId}));
  return true;
}

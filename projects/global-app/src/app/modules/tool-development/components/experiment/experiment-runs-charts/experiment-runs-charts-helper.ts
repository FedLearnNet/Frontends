import {cloneDeep} from "lodash";
import {ExperimentRunDTO} from "@shared-lib/modules/app-execution/dto/experiment";


export function groupRunsByMetric(runs: ExperimentRunDTO[]): Map<string, ExperimentRunDTO[]> {
  const metricMap = new Map<string, ExperimentRunDTO[]>();
  runs.forEach(run => {
    getUniqueMetrics(run).forEach(metric => {
      const filteredRun = cloneDeep(run);
      filteredRun.metrics = run.metrics.filter(m => m.metric === metric);
      if (!metricMap.has(metric)) {
        metricMap.set(metric, []);
      }
      metricMap.get(metric)!.push(filteredRun);
    });
  });

  return metricMap;
}

export function getUniqueMetrics(run: ExperimentRunDTO): string[] {
  if (!run.metrics) {
    return [];
  }
  return Array.from(new Set(run.metrics.map(m => m.metric)));
}

export function getHyperParams(run: ExperimentRunDTO): string[] {
  if (!run.hyperParams) {
    return [];
  }
  return Object.keys(run.hyperParams);
}


import {ExperimentRunDTO} from "../../../dto/experiment";
import {cloneDeep} from "lodash";


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
  return Array.from(new Set(run.metrics.map(m => m.metric)));
}

export function getHyperParams(run: ExperimentRunDTO): string[] {
  return Object.keys(run.hyperParams);
}


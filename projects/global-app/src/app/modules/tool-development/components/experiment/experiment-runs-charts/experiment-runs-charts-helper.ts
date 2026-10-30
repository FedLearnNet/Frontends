import {cloneDeep} from "lodash";
import {TestAttemptDTO} from "../../../dto/test-run";


export function groupRunsByMetric(runs: TestAttemptDTO[]): Map<string, TestAttemptDTO[]> {
  const metricMap = new Map<string, TestAttemptDTO[]>();
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

export function getUniqueMetrics(run: TestAttemptDTO): string[] {
  if (!run.metrics) {
    return [];
  }
  return Array.from(new Set(run.metrics.map(m => m.metric)));
}

export function getHyperParams(run: TestAttemptDTO): string[] {
  return Object.keys(run.params ?? {});
}


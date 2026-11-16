import {TestAttemptDTO, TestRunCreateDTO, TestRunDTO} from "./test-run";
import {FederatedTestRunCreateDTO} from "./federated-test-run";

export enum TestEngineMode {
  // Serves test runs, experiments and federated test runs until stopped, like a local engine
  ENGINE = "ENGINE",
  // Runs once with the input the app generates in test mode, then exits
  SELF_TEST = "SELF_TEST",
  // Serves one test run, then stops
  SINGLE_RUN = "SINGLE_RUN",
  FEDERATED_RUN = "FEDERATED_RUN",
}

export interface TestEngineCreateDTO {
  mode: TestEngineMode;
  testRun?: TestRunCreateDTO;
  federatedTestRun?: FederatedTestRunCreateDTO;
}

export const testEngineModeLabels: Record<TestEngineMode, string> = {
  [TestEngineMode.ENGINE]: 'Engine',
  [TestEngineMode.SELF_TEST]: 'Self-test',
  [TestEngineMode.SINGLE_RUN]: 'Single run',
  [TestEngineMode.FEDERATED_RUN]: 'Federated test experiment',
};

export function connectsAsEngine(engine: TestRunDTO): boolean {
  return engine.engineMode === TestEngineMode.ENGINE;
}

// The container of a TEST_HOSTING run, once the run started
export function engineAttemptOf(engine: TestRunDTO): TestAttemptDTO | undefined {
  return engine.steps[0]?.attempts?.[0];
}

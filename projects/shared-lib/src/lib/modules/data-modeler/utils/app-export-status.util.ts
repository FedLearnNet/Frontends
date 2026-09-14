import {StatusBadeType} from "@shared-lib/components/status-badge/status-badge.component";
import {
  PatientToolRunStatus
} from "../../../../../../local-app/src/app/modules/patient/dto/patient-tool-run";

/** How the status of an app-based export run is shown. */
export const APP_EXPORT_STATUS_BADGES: Record<PatientToolRunStatus, StatusBadeType> = {
  PENDING: 'PENDING',
  INITIALIZED: 'INIT',
  STARTED: 'RUNNING',
  RUNNING: 'RUNNING',
  FINISHED: 'SUCCESS',
  STOPPED: 'STOPPED',
  ERROR: 'FAILED',
};

export const APP_EXPORT_STATUS_TEXT: Record<PatientToolRunStatus, string> = {
  PENDING: 'Preparing the export',
  INITIALIZED: 'Preparing the export',
  STARTED: 'Starting the export app',
  RUNNING: 'The export app is running',
  FINISHED: 'Export finished',
  STOPPED: 'Export stopped',
  ERROR: 'Export failed',
};

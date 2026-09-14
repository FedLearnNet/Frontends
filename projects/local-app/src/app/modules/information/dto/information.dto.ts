import {NotificationDTO} from "@shared-lib/base/notifications";

export interface UserInformationDTO {
  notifications: NotificationDTO[];
  openTrainingRequests: number;
  openStatisticsRequests: number;
  openMetricsRequests: number;
}


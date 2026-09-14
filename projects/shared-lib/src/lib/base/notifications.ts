import {BaseDto} from "@shared-lib/base/base-dto";


export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  SUCCESS = 'SUCCESS',
  ACTION_REQUIRED = 'ACTION_REQUIRED',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
  ARCHIVED = 'ARCHIVED',
}

export enum NotificationPriority {
  LOW = "LOW",
  NORMAL = "NORMAL",
  HIGH = "HIGH",
  CRITICAL = "CRITICAL",
}

export interface NotificationDTO extends BaseDto {
  recipientUserId: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  sourceService: string;
  sourceEntityType: string;
  sourceEntityId: string;
  actionUrl: string;
  status: NotificationStatus;
  deliveryAttemptCount: number;
  deliveryErrorMessage: string;
  deliveredAt: Date;
  deliveredFailedAt: Date;
  readAt: Date;
  archivedAt: Date;
}

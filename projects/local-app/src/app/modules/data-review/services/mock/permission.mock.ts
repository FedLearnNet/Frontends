import { Permission } from '@local-app/data-review/models';

export const PERMISSIONS: Permission[] = [
  {
    id: '0',
    cohortId: '1',
    userId: '0', // Assuming 'groupOrUser: 0' corresponds to 'userId'
    groupId: null,
    isAllowedToQuery: false, // Defaulted to false based on absence in original data
    queryRetryTime: null, // No value provided in original data
    querySampleThreshold: null,
    autoTrainingAccess: null,
    createdAt: '2024-11-28T12:00:00Z', // You can adjust the date as needed
    updatedAt: '2024-11-28T12:00:00Z',
  },
  {
    id: '1',
    cohortId: '2',
    userId: '0',
    groupId: null,
    isAllowedToQuery: true, // Assuming based on context
    queryRetryTime: 3, // From 'specificGroupInterval: 3' in original data
    querySampleThreshold: 100, // From 'querySampleThreshold: 100'
    autoTrainingAccess: null,
    createdAt: '2024-11-28T12:00:00Z',
    updatedAt: '2024-11-28T12:00:00Z',
  },
  {
    id: '2',
    cohortId: '2',
    userId: '2',
    groupId: null,
    isAllowedToQuery: false,
    queryRetryTime: null,
    querySampleThreshold: null,
    autoTrainingAccess: 'Certified Apps', // Mapped from 'accessWith: 1'
    createdAt: '2024-11-28T12:00:00Z',
    updatedAt: '2024-11-28T12:00:00Z',
  },
];
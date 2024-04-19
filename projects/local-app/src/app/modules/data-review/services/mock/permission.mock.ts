import { Permission } from '@local-app/data-review/models';

export const PERMISSIONS: Permission[] = [
    {
        id: 0,
        cohort: 1,
        groupOrUser: 0,
        permissions: {
            querySampleThreshold: null,
            specificGroupInterval: null,
            anyGroupInterval: null,
            maxQueryLimit: null,
            accessWith: null,
        },
    },
    {
        id: 1,
        cohort: 2,
        groupOrUser: 0,
        permissions: {
            querySampleThreshold: 100,
            specificGroupInterval: 3,
            anyGroupInterval: 1,
            maxQueryLimit: 50,
            accessWith: null,
        },
    },
    {
        id: 2,
        cohort: 2,
        groupOrUser: 2,
        permissions: {
            querySampleThreshold: null,
            specificGroupInterval: null,
            anyGroupInterval: null,
            maxQueryLimit: null,
            accessWith: 1,
        },
    },
];

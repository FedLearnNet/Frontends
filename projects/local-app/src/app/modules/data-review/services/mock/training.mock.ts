import { Training, TrainingStatus } from '@local-app/data-review/models';

export const TRAININGS: Training[] = [
    {
        id: 0,
        user: 3,
        requestedData: [
            {
                id: 0,
                name: 'Cohort X, 1100 Samples',
                link: '#cohort-x-1100',
            },
            {
                id: 1,
                name: 'Cohort Y, 1300 Samples',
                link: '#cohort-y-1300',
            },
        ],
        workflow: {
            id: 0,
            name: 'Normalization -> Linear Regression',
            link: '#norm-lin',
        },
        description: 'desc',
        date: new Date('2023-09-08'),
        status: TrainingStatus.Pending,
    },
    {
        id: 1,
        user: 3,
        requestedData: [
            {
                id: 0,
                name: 'Cohort X, 500 Samples',
                link: '#cohort-x-500',
            },
        ],
        workflow: {
            id: 0,
            name: 'Normalization -> SVM',
            link: '#norm-svm',
        },
        description: 'desc',
        date: new Date('2023-07-03'),
        status: TrainingStatus.Completed,
    }
];

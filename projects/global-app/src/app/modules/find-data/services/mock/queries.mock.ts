import { Query } from '@global-app/find-data/models';

export const QUERIES: Query[] = [
    {
        id: 1,
        name: 'Dummy query',
        description: 'Dummy description',
        queryString: '[Age] = 19 AND [Microbiome file] contains "test" AND [Age] > 30',
        result: {
            datasets: 5678,
            holders: 5,
        },
        workflows: [
            {
                id: 0,
                name: 'Dummy workflow',
                description: 'Workflow description',
                applications: [
                    {
                        id: 0,
                        name: 'Normalization',
                        description: 'Normalizes input by variance',
                        position: 0,
                        image: 'https://featurecloud.ai/media/app_icons/5e09b02b-47d.png',
                    },
                    {
                        id: 1,
                        name: 'Linear Regression',
                        description: 'An Ordinary Least Squares (OLS) linear regression model.',
                        position: 1,
                        image: 'https://featurecloud.ai/media/app_icons/8b22bcf3-acc.png',
                    },
                    {
                        id: 2,
                        name: 'Evaluation (Regr.)',
                        description: 'An app, computing various metrics to evaluate the performance of a regression model',
                        position: 2,
                        image: 'https://featurecloud.ai/media/app_icons/4d7fb5e3-5d0.png',
                    },
                ],
                status: 0,
                approved: {
                    datasets: null,
                    holders: null,
                },
            },
            {
                id: 1,
                name: 'Dummy workflow 2',
                description: 'Dummy workflow 2 description',
                applications: [],
                status: 0,
                approved: {
                    datasets: null,
                    holders: null,
                },
            },
        ]
    },
    {
        id: 2,
        name: 'Dummy query name v2',
        description: 'Dummy query name v2 - description',
        queryString: '[Age] >= 45 AND [Colorectal cancer] = true',
        result: {
            datasets: null,
            holders: null,
        },
        workflows: [],
    },
];

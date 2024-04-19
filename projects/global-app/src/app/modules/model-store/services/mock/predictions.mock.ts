import { Prediction } from '../../models';
import { MODELS } from './models.mock';

export const PREDICTIONS: Prediction[] = [
    {
        id: 0,
        model: MODELS[0],
        status: 'Finished',
        date: new Date('2023-09-08'),
        result: [
            { id: 0, value: true, },
            { id: 1, value: false, },
            { id: 2, value: false, },
            { id: 3, value: true, },
            { id: 4, value: false, },
        ],
    },
];

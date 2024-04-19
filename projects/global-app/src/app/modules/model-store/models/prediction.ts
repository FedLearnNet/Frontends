import { Model } from './model';

export interface Prediction {
    id: number;
    model: Model;
    status: string;
    date: Date;
    result: any[];
}

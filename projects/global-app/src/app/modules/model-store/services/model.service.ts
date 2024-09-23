import {Injectable} from '@angular/core';
import {Model, Prediction} from '../models';
import {Observable, of} from 'rxjs';
import {MODELS, PREDICTIONS} from './mock';
import {isEmpty, cloneDeep} from 'lodash';
import {isNotNull} from '@shared-lib/utils';

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  models: Model[] = [];
  predictions: Prediction[] = [];

  constructor() {
  }

  getAllModels(): Observable<Model[]> {
    this.checkModelList();

    return of(this.models);
  }

  getModels(filterData: object = {}): Observable<Model[]> {
    this.checkModelList();

    if (isEmpty(filterData)) return this.getAllModels();

    return of(this.filterModels(cloneDeep(this.models), filterData))
  }

  filterModels(array: Model[], filter: any): Model[] {
    return array.filter((obj: any) => {
      for (const key in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, key) && isNotNull(filter[key])) {
          if (!obj[key].toLowerCase().includes(filter[key].toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }

  getModel(modelId: number): Observable<Model> {
    this.checkModelList();

    return of(this.models.find(model => model.id === modelId) as Model);
  }

  predictUsingModel(modelId: number, files: any): Observable<boolean> {
    console.debug('predictUsingModel', modelId, files);
    this.checkModelList();
    this.checkPredictionList();

    this.predictions.push({
      id: (this.predictions.map(prediction => prediction.id).sort().pop() ?? 1) + 1,
      model: this.models.find(model => model.id === modelId) as Model,
      status: 'Finished',
      date: new Date(),
      result: this.generateRandomBooleanArray(),
    });

    return of(true);
  }

  getAllPredictions(): Observable<Prediction[]> {
    this.checkPredictionList();

    return of(this.predictions);
  }

  getPredictions(filterData: object = {}): Observable<Prediction[]> {
    this.checkPredictionList();

    if (isEmpty(filterData)) return this.getAllPredictions();

    return of(this.filterPredictions(cloneDeep(this.predictions), filterData))
  }

  filterPredictions(array: Prediction[], filter: any): Prediction[] {
    return array.filter((obj: any) => {
      for (const key in filter) {
        if (Object.prototype.hasOwnProperty.call(filter, key) && isNotNull(filter[key])) {
          if (!obj.model[key].toLowerCase().includes(filter[key].toLowerCase())) {
            return false;
          }
        }
      }
      return true;
    });
  }

  getPredictionResults(predictionId: number): Observable<{ id: number; value: boolean }[]> {
    this.checkPredictionList();

    return of(this.predictions.find(prediction => prediction.id === predictionId)?.result ?? []);
  }

  private checkModelList(): void {
    if (this.models.length === 0) {
      this.models = MODELS;
    }
  }

  private checkPredictionList(): void {
    if (this.predictions.length === 0) {
      this.predictions = PREDICTIONS;
    }
  }

  private generateRandomBooleanArray(): { id: number; value: boolean }[] {
    const length = Math.floor(Math.random() * 10) + 1;

    return Array.from({length}, (_, index) => ({
      id: index + 1,
      value: Math.random() < 0.5,
    }));
  }
}

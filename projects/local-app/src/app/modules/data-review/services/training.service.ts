import { Injectable } from '@angular/core';
import { Training, TrainingStatus } from '@local-app/data-review/models';
import { Observable, of } from 'rxjs';
import { GROUPS_AND_USERS, TRAININGS } from '@local-app/data-review/services/mock';
import { cloneDeep } from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {
  protected trainingList: Training[] = [];

  constructor() { }

  getAllTrainings(): Observable<Training[]> {
    if (this.trainingList.length === 0) {
      this.trainingList = TRAININGS;
    }

    return of(this.getReturnableTrainingList());
  }

  acceptTraining(trainingId: number): Observable<Training[]> {
    this.changeTrainingStatus(trainingId, TrainingStatus.Completed);

    return of(this.getReturnableTrainingList());
  }

  rejectTraining(trainingId: number): Observable<Training[]> {
    this.changeTrainingStatus(trainingId, TrainingStatus.Rejected);

    return of(this.getReturnableTrainingList());
  }

  changeTrainingStatus(trainingId: number, status: TrainingStatus): void {
    const trainingIndex = this.trainingList.findIndex(training => training.id === trainingId);

    this.trainingList[trainingIndex] = {
      ...this.trainingList[trainingIndex],
      status: status,
    };
  }

  private getReturnableTrainingList(): Training[] {
    const returnableTrainingList = cloneDeep(this.trainingList);

    this.trainingList.forEach((training, index) => {
      returnableTrainingList[index].user = GROUPS_AND_USERS.find(groupAndUser => groupAndUser.id === this.trainingList[index].user)?.name ?? '';
      returnableTrainingList[index].status = TrainingService.getTrainingStatusText(returnableTrainingList[index].status);
    });

    return returnableTrainingList;
  }

  private static getTrainingStatusText(status: TrainingStatus | string): string {
    switch (status) {
      case TrainingStatus.Pending:
        return 'Pending';
      case TrainingStatus.Completed:
        return 'Completed';
      case TrainingStatus.Rejected:
        return 'Rejected';
      default:
        return '';
    }
  }
}

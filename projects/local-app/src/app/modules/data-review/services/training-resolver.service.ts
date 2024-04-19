import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import { Training } from '@local-app/data-review/models';
import { TrainingService } from '@local-app/data-review/services/training.service';

export const trainingListResolver: ResolveFn<Training[]> = () => {
  return inject(TrainingService).getAllTrainings();
}

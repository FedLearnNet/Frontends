import { Component, ViewChild, OnInit } from '@angular/core';
import { MatTable } from '@angular/material/table';
import { CohortDetail, Training, WorkflowDetail } from '@local-app/data-review/models';
import { TrainingService } from '@local-app/data-review/services/training.service';
import { ActivatedRoute } from '@angular/router';
import { ResponsiveService } from '@shared-lib/services/responsive.service';
import { XSMALL } from '@shared-lib/constants';

@Component({
    selector: 'app-data-review-training-grid',
    templateUrl: './training-grid.component.html',
    styleUrl: './training-grid.component.scss',
})
export class TrainingGridComponent implements OnInit {
    isXSmallScreen: boolean = false;
    trainings: Training[];

    displayedColumns: string[] = ['actions', 'user', 'requestedData', 'workflow', 'description', 'date', 'status'];

    @ViewChild(MatTable) table: MatTable<Training>;

    constructor(
        private activatedRoute: ActivatedRoute,
        private trainingService: TrainingService,
        private responsiveService: ResponsiveService,
    ) { }

    ngOnInit() {
        this.activatedRoute.data.subscribe(({ trainings }) => this.trainings = trainings);

        this.checkAndAdjustResponsiveLayout();
    }

    checkAndAdjustResponsiveLayout(): void {
        this.responsiveService
            .getScreenSize()
            .subscribe(screenSize => this.isXSmallScreen = screenSize === XSMALL);
    }

    acceptTraining(training: Training) {
        this.trainingService.acceptTraining(training.id)
            .subscribe(trainingList => {
                this.trainings = trainingList;
                this.table.renderRows();
            });
    }

    rejectTraining(training: Training) {
        this.trainingService.rejectTraining(training.id)
            .subscribe(trainingList => {
                this.trainings = trainingList;
                this.table.renderRows();
            });
    }

    isTrainingPending(status: string): boolean {
        return status === 'Pending';
    }

    getRequestedDataLabel(requestedData: CohortDetail[]): string {
        let requestedDataLabel = '';

        requestedData.forEach(data => {
            requestedDataLabel += `<a href=${ data.link } rel="nofollow" target="_blank">${ data.name }</a>\n`;
        });

        return requestedDataLabel;
    }

    getWorkflowLabel(workflow: WorkflowDetail): string {
        return `<a href=${ workflow.link } rel="nofollow" target="_blank">${ workflow.name }</a>`;
    }

    getDateLabel(date: Date): string {
        return date.toISOString().substring(0, 10);
    }
}

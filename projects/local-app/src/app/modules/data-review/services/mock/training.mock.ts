import { Training, TrainingStatus } from '@local-app/data-review/models'

export const TRAININGS: Training[] = [
    {
        flRequestId: 'fl_request_001',
        platformUserId: 3,
        requestData: [
            {
                id: 0,
                flRequest: 'fl_request_001',
                cohortId: 'ec6f5a02-db20-490d-8106-ae3d2bb6ee7b',
                cohortName: 'Cohort 1',
                patientIds: ['XTGJA', 'ASF11EWNBD32', 'TWYSGAHJN12']
            },
            {
                id: 1,
                flRequest: 'fl_request_001',
                cohortId: 'ec6f5a02-db20-490d-8106-ae3d2bb6ee7b',
                cohortName: 'Cohort 2',
                patientIds: ['V5DWTBDC78S70', '45WDXS56W', 'scsdc48s4cs', 'vwsdc4s5455ac', 'CSWSX4510acs', '78FSAC23SAD', 'FCSA545ACS', 'CSA45']
            },
        ],
        flAppWorkflow: [{
            id: 0,
            name: 'Normalization -> Linear Regression',
            desc: 'Workflow description',
            version: '1.0.0',
            hyperparams: 'None',
        }],
        description: 'desc',
        createdAt: new Date('2023-09-08'),
        updatedAt: new Date('2023-11-12'),
        flRequestStatus: TrainingStatus.Pending,
        queryId: 'query_01'
    },
    {
        flRequestId: 'fl_request_002',
        platformUserId: 3,
        requestData: [
            {
                id: 0,
                flRequest: 'fl_request_002',
                cohortId: 'ec6f5a02-db20-490d-8106-ae3d2bb6ee7b',
                cohortName: 'Cohort 1',
                patientIds: ['SCAGXSABH56', '45WDXS56W', 'scsdc48s4cs', 'vwsdc4s5455ac', 'SAH6523']
            },
        ],
        flAppWorkflow: [{
            id: 0,
            name: 'Normalization -> SVM',
            desc: 'Workflow descriptions',
            version: '1.2.0',
            hyperparams: 'None',
        }],
        description: 'desc',
        createdAt: new Date('2023-07-03'),
        updatedAt: new Date('2023-10-08'),
        flRequestStatus: TrainingStatus.Completed,
        queryId: 'query_02',
    }
]
4

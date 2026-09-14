export interface CohortPatient {
    id: number;
    version: string | number;
    schemaNodeId: number;
    value: string | number;
    visitId: string;
    visitTimestamp: Date;
    visitTimestampFormat: string;
    metadata: any[];
    createdAt: Date;
    updatedAt: Date;
}

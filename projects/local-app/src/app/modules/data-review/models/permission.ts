export interface Permission {
    id: number;
    cohort: number | string;
    groupOrUser: number | string;
    permissions: {
        querySampleThreshold: number | null;
        specificGroupInterval: number | null;
        anyGroupInterval: number | null;
        maxQueryLimit: number | null;
        accessWith: number | string | null;
    };
}

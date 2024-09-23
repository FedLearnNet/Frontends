import { SelectOption } from '@shared-lib/models';
import { QueryOption } from '@global-app/find-data/models/query-option';

export interface QueryConfig {
    name: string;
    label: string;
    ontologyId: string;
    description: string;
    options: SelectOption[];
    queryOption: QueryOption;
}

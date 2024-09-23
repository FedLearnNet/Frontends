import { SelectOption } from '@shared-lib/models';

export interface QueryOption {
    type: string;
    description: string;
    options: Array<SelectOption>;
}

import { QueryOption } from '@global-app/find-data/models';
import { DataType } from '@global-app/find-data/enums';

export const QUERY_OPTIONS_CONFIG: QueryOption[] = [
    {
        type: DataType.INTEGER,
        description: 'Numeric fields',
        options: [
            { label: 'Equals', value: '==' },
            { label: 'Greater than', value: '>' },
            { label: 'Greater than or equal', value: '>=' },
            { label: 'Less than', value: '<' },
            { label: 'Less than or equal', value: '<=' },
            { label: 'Not equal', value: '!=' }
        ]
    },
    {
      type: DataType.FLOAT,
      description: 'Floating point numeric fields',
      options: [
        { label: 'Equals', value: '==' },
        { label: 'Greater than', value: '>' },
        { label: 'Greater than or equal', value: '>=' },
        { label: 'Less than', value: '<' },
        { label: 'Less than or equal', value: '<=' },
        { label: 'Not equal', value: '!=' }
      ]
    },
    {
        type: DataType.STRING,
        description: 'String fields',
        options: [
            { label: 'Contains', value: 'contains' },
            { label: 'Equals', value: 'eq' },
            { label: 'Starts with', value: 'starts_with' },
            { label: 'Ends with', value: 'ends_with' },
            { label: 'Not equal', value: 'neq' }
        ]
    },
    {
        type: DataType.BOOLEAN,
        description: 'Boolean fields',
        options: [
            { label: 'Equals', value: '==' },
            { label: 'Not equal', value: '!=' }
        ]
    },
    {
        type: DataType.DATE,
        description: 'Date fields',
        options: [
            { label: 'Equals', value: 'eq' },
            { label: 'Before', value: 'lt' },
            { label: 'After', value: 'gt' },
            { label: 'Not equal', value: 'neq' }
        ]
    },
    {
        type: DataType.CATEGORICAL,
        description: 'Categorical fields',
        options: [
            { label: 'Equals', value: '==' },
            { label: 'Not equal', value: '!=' }
        ]
    },
];

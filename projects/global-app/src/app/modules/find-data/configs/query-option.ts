import {DataTypeOperatorMap} from '@global-app/find-data/models';
import {DataTypes} from '@global-app/schema/dto/datatype';
import {QueryOperatorTypes} from '@global-app/find-data/dto/query';

const EXISTENCE_OPERATORS = [
  {label: 'Exists', value: QueryOperatorTypes.EXISTS},
  {label: 'Does not exist', value: QueryOperatorTypes.NOT_EXISTS}
];

export const QUERY_OPERATOR_OPTIONS_CONFIG: DataTypeOperatorMap[] = [
  {
    type: DataTypes.INT,
    description: 'Numeric fields',
    options: [
      {label: 'Equals', value: QueryOperatorTypes.EQUAL},
      {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
      {label: 'Greater than', value: QueryOperatorTypes.BIGGER},
      {label: 'Greater than or equal', value: QueryOperatorTypes.BIGGER_EQUAL},
      {label: 'Less than', value: QueryOperatorTypes.SMALLER},
      {label: 'Less than or equal', value: QueryOperatorTypes.SMALLER_EQUAL},
      ...EXISTENCE_OPERATORS
    ]
  },
  {
    type: DataTypes.FLOAT,
    description: 'Floating point numeric fields',
    options: [
      {label: 'Equals', value: QueryOperatorTypes.EQUAL},
      {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
      {label: 'Greater than', value: QueryOperatorTypes.BIGGER},
      {label: 'Greater than or equal', value: QueryOperatorTypes.BIGGER_EQUAL},
      {label: 'Less than', value: QueryOperatorTypes.SMALLER},
      {label: 'Less than or equal', value: QueryOperatorTypes.SMALLER_EQUAL},
      ...EXISTENCE_OPERATORS
    ]
  },
  {
    type: DataTypes.STRING,
    description: 'String fields',
    options: [
      {label: 'Equals', value: QueryOperatorTypes.EQUAL},
      {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
      {label: 'Contains', value: QueryOperatorTypes.CONTAINS},
      {label: 'Does not contain', value: QueryOperatorTypes.NOT_CONTAINS},
      {label: 'Matches regex', value: QueryOperatorTypes.REGEX},
      {label: 'Starts with', value: QueryOperatorTypes.START_WIDTH},
      {label: 'Ends with', value: QueryOperatorTypes.END_WIDTH},
      ...EXISTENCE_OPERATORS
    ]
  },
  {
    type: DataTypes.BOOLEAN,
    description: 'Boolean fields',
    options: [
      {label: 'Equals', value: QueryOperatorTypes.EQUAL},
      {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
      ...EXISTENCE_OPERATORS
    ]
  },
  {
    type: DataTypes.DATE,
    description: 'Date fields',
    options: [
      {label: 'Equals', value: QueryOperatorTypes.EQUAL},
      {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
      {label: 'Before', value: QueryOperatorTypes.SMALLER},
      {label: 'On or before', value: QueryOperatorTypes.SMALLER_EQUAL},
      {label: 'After', value: QueryOperatorTypes.BIGGER},
      {label: 'On or after', value: QueryOperatorTypes.BIGGER_EQUAL},
      ...EXISTENCE_OPERATORS
    ]
  },
  {
    type: DataTypes.CATEGORICAL,
    description: 'Categorical fields',
    options: [
      {label: 'Equals', value: QueryOperatorTypes.EQUAL},
      {label: 'Not equal', value: QueryOperatorTypes.NOT_EQUAL},
      {label: 'In', value: QueryOperatorTypes.IN},
      {label: 'Not in', value: QueryOperatorTypes.NOT_IN},
      ...EXISTENCE_OPERATORS
    ]
  }
];

export function isOperatorWithValue(operator: QueryOperatorTypes | string | null | undefined): boolean {
  return operator !== QueryOperatorTypes.EXISTS
    && operator !== QueryOperatorTypes.NOT_EXISTS;
}

import {DataTypes, DataTypeValidationType} from "@global-app/schema/dto/datatype";

export interface DataTypeCombinations {
  value: DataTypes;
  viewValue: string;
  possibleValidators?: DataTypeValidationType[];
}

export const dataTypeCombinations: DataTypeCombinations[] = [
  {
    value: DataTypes.INT,
    viewValue: 'Integer',
    possibleValidators: [DataTypeValidationType.MIN, DataTypeValidationType.MAX]
  },
  {
    value: DataTypes.FLOAT,
    viewValue: 'Float',
    possibleValidators: [DataTypeValidationType.MIN, DataTypeValidationType.MAX]
  },
  {
    value: DataTypes.BOOLEAN,
    viewValue: 'Boolean',
    possibleValidators: []
  },
  {
    value: DataTypes.STRING,
    viewValue: 'Text',
    possibleValidators: [
      DataTypeValidationType.MINLENGTH,
      DataTypeValidationType.MAXLENGTH,
      DataTypeValidationType.PATTERN
    ]
  },
  {value: DataTypes.FILE, viewValue: 'File (?)'},
  {
    value: DataTypes.DATE,
    viewValue: 'Date (?)',
    possibleValidators: [
      DataTypeValidationType.MINLENGTH,
      DataTypeValidationType.MAXLENGTH,
      DataTypeValidationType.PATTERN
    ]
  },
  {
    value: DataTypes.DATE_TIME,
    viewValue: 'date-time (?)',
    possibleValidators: [
      DataTypeValidationType.MINLENGTH,
      DataTypeValidationType.MAXLENGTH,
      DataTypeValidationType.PATTERN
    ]
  },
  {value: DataTypes.CATEGORICAL, viewValue: 'categorical'},
];

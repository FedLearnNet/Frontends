import { Model } from '../../models';

export const MODELS: Model[] = [
    {
        id: 1,
        name: 'CRC Predictor',
        author: 'Julian Klemm',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/954/954514.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge, LOING.BMI, CUSTOM.sequence

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 2,
        name: 'CRC Predictor 2',
        author: 'Julian Klemm',
        imageUrl: 'https://cdn4.iconfinder.com/data/icons/colon-and-rectal-colorectal-cancer/250/colorectal-cancer-001-512.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge, LOING.BMI

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 3,
        name: 'CRC Predictor 3',
        author: 'Julian Klemm',
        imageUrl: 'https://static.thenounproject.com/png/2007062-200.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge, LOING.BMI

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 4,
        name: 'CRC Predictor 4',
        author: 'Julian Klemm',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/954/954514.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge, CUSTOM.sequence

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 5,
        name: 'CRC Predictor 5',
        author: 'Julian Klemm',
        imageUrl: 'https://cdn4.iconfinder.com/data/icons/colon-and-rectal-colorectal-cancer/250/colorectal-cancer-001-512.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge, LOING.BMI, CUSTOM.sequence

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 6,
        name: 'CRC Predictor 6',
        author: 'Julian Klemm',
        imageUrl: 'https://static.thenounproject.com/png/2007062-200.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge, CUSTOM.sequence

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 7,
        name: 'CRC Predictor 7',
        author: 'Julian Klemm',
        imageUrl: 'https://cdn-icons-png.flaticon.com/512/954/954514.png',
        inputData: `A csv file containing the following column is expected:
            id, LOING.BMI, CUSTOM.sequence

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 8,
        name: 'CRC Predictor 8',
        author: 'Julian Klemm',
        imageUrl: 'https://cdn4.iconfinder.com/data/icons/colon-and-rectal-colorectal-cancer/250/colorectal-cancer-001-512.png',
        inputData: `A csv file containing the following column is expected:
            id, LOING.BMI

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
    {
        id: 9,
        name: 'CRC Predictor 9',
        author: 'Julian Klemm',
        imageUrl: 'https://static.thenounproject.com/png/2007062-200.png',
        inputData: `A csv file containing the following column is expected:
            id, LOINC.CurrentAge

            Additionally, the columns CUSTOM.sequence must contain filenames, where each file is a fasq file
        `,
        predictedConcept: 'mondo.Colorectal Cancer',
    },
];

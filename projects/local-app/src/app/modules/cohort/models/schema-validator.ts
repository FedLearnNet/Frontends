export interface SchemaValidator {
    name: string;
    validator: string;
    message: string;
    placeholders?: any;
}

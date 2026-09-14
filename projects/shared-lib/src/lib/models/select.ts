export interface SelectOption<T = number | string | boolean> {
  // Used in a generic manner for anything that has a label to show to the user
  // and an actual value to use in e.g. backend queries
  value: T;
  label: string;
}


export interface ParameterInfo {
  name: string;
  keys: string[];
  choices?: string[];
  type?: string;
  default_value?: string;
  doc?: string;
}

export interface FunctionsDetailDTO {
  module: string;
  methodName: string;
  parameters: ParameterInfo[];
  returnKeys: string[];
  inputMapping?: { [key: string]: string };
  returnMapping?: { [key: string]: string };
  column?: string;
  onRow?: boolean;
  forList?: boolean;
  doc?: string;
}


export function functionToDetailCard(result: FunctionsDetailDTO): string {
  let content = '';
  if (!result.onRow) {
    content = `<strong style="font-weight: bolder;">Column:</strong> ${result.column}`;
  } else {
    content = `<strong style="font-weight: bolder;">Input:</strong><ul style="margin: 0;">`;
    if (result.inputMapping) {
      for (const [key, value] of Object.entries(result.inputMapping)) {
        content += `<li><strong>${key}:</strong> ${value.replaceAll('[VALUE]', '')}</li>`;
      }
    }
    content += '</ul>';

    // Add output
    if (result.returnMapping) {
      content += `<strong style="font-weight: bolder;">Output:</strong><ul style="margin: 0;">`;
      for (const [, value] of Object.entries(result.returnMapping)) {
        content += `<li>${value}</li>`;
      }
      content += '</ul>';
    }
  }
  return content;
}

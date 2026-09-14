import {ToolConfigHyperParamDataType, ToolHyperParamConfigDTO} from "@shared-lib/modules/app-execution/dto/config";
import {Injectable} from "@angular/core";
import {BaseValidationResultDTO} from "@shared-lib/base/base-dto";


@Injectable({
  providedIn: 'root'
})
export class HyperParamValidationService {

  public validateHyperParamValues(hyperparams: ToolHyperParamConfigDTO[], values: { [key: string]: any } | undefined) {
    if (!hyperparams) {
      return true;
    }
    if (!values && hyperparams.length === 0) {
      return true;
    }
    if (!values) {
      return false;
    }
    for (const h of hyperparams) {
      if (!h.variableName) {
        return false;
      }
      const value = values[h.variableName];
      if (value === undefined || value === null) {
        return false;
      }
      const result = this.validateInputValues(value, h);
      if (!result || !result.ok) {
        return false;
      }
    }
    return true;
  }

  public validateInputValues(value: any, config: ToolHyperParamConfigDTO): BaseValidationResultDTO {
    const errorMessages: string[] = [];
    let hasError = false;
    const values = this.getParsedValues(value, config);
    if (values === null) {
      hasError = true;
      errorMessages.push('Input is required');
      return {
        ok: hasError,
        errors: errorMessages
      }
    }
    if (value !== undefined && values.length === 0) {
      if (this.isNumber(config)) {
        errorMessages.push(`Value '${value}' is not a valid number`);
        hasError = true;
      } else {
        errorMessages.push(`Value '${value}' can be parsed`);
        hasError = true;
      }
    }
    values.forEach(part => {
      if (this.isNumber(config)) {
        if (isNaN(part)) {
          errorMessages.push(`Value '${part}' is not a valid number`);
          hasError = true;
        }
        if (config.minValue && part < config.minValue!) {
          errorMessages.push(`Value ‘${part}’ is less than the minimum ${config.minValue}`);
          hasError = true;
        }
        if (config.maxValue && part > config.maxValue!) {
          errorMessages.push(`Value ‘${part}’ is greater than the maximum ${config.maxValue}`);
          hasError = true;
        }
      }
      if (config.type === ToolConfigHyperParamDataType.STRING && config.pattern) {
        if (!new RegExp(config.pattern!).test(part)) {
          errorMessages.push(`Value ‘${part}’ does not match the pattern. ${config.pattern}`);
          hasError = true;
        }
      }
      if (config.type === ToolConfigHyperParamDataType.CATEGORICAL && config.options
        && !config.options!.includes(part)) {
        errorMessages.push(`Value ‘${part}’ is not a valid option`);
        hasError = true;
      }
    });
    return {
      ok: !hasError,
      errors: errorMessages
    }
  }

  public getParsedValues(value: any, config: ToolHyperParamConfigDTO): any[] | null {
    const input = "" + value;
    if (!input || input === "") {
      return null;
    }
    const values: any[] = [];
    const parts = input.split(',');

    parts.forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        if (this.isNumber(config)) {
          const [startStr, endStr] = part.split('-').map(s => s.trim());
          const start = this.parseValue(startStr, config);
          const end = this.parseValue(endStr, config);
          if (start !== null && end !== null) {
            for (let i = start; i <= end; i += this.getStep(config)) {
              values.push(parseFloat(i.toFixed(10)));
            }
          }
        } else if (config.type === ToolConfigHyperParamDataType.STRING
          || config.type === ToolConfigHyperParamDataType.CATEGORICAL) {
          if (part) {
            values.push(part);
          }
        }
      } else {
        if (this.isNumber(config)) {
          const value = this.parseValue(part, config);
          if (value !== null) {
            values.push(value);
          }
        } else if (config.type === ToolConfigHyperParamDataType.BOOLEAN) {
          values.push(part === 'true');
        } else {
          if (part) {
            values.push(part);
          }
        }

      }
    });
    return values;
  }

  private isNumber(config: ToolHyperParamConfigDTO): boolean {
    return config.type === ToolConfigHyperParamDataType.INTEGER ||
      config.type === ToolConfigHyperParamDataType.FLOAT;
  }


  private parseValue(valueStr: string, config: ToolHyperParamConfigDTO): number | null {
    let value: number;

    if (config.type === ToolConfigHyperParamDataType.INTEGER) {
      value = parseInt(valueStr, 10);
      if (isNaN(value) || !/^-?\d+$/.test(valueStr)) {
        return null;
      }
    } else if (config.type === ToolConfigHyperParamDataType.FLOAT) {
      value = parseFloat(valueStr);
      if (isNaN(value) || !/^-?\d+(\.\d+)?$/.test(valueStr)) {
        return null;
      }
    } else {
      return null;
    }
    return value;
  }

  private getStep(config: ToolHyperParamConfigDTO): number {
    if (config.type === ToolConfigHyperParamDataType.INTEGER) {
      return 1;
    } else if (config.type === ToolConfigHyperParamDataType.FLOAT) {
      return 0.1;
    }
    return 1;
  }
}

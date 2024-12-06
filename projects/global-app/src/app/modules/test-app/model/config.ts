import {ConfigHyperparamDTO, ConfigInputDTO, ConfigOutputDTO} from "../dto/config";

export interface ConfigHyperparamEditModel extends ConfigHyperparamDTO {
  editMode?: boolean;
}


export interface ConfigInputEditModel extends ConfigInputDTO {
  editMode?: boolean;
}

export interface ConfigOutputEditModel extends ConfigOutputDTO {
  editMode?: boolean;
}

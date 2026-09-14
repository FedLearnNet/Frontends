export interface UMLSSearchResultDTO {
  ui: string;
  name: string;
  rootSource: string;

}

export interface UMLSDetailResultDTO extends UMLSSearchResultDTO {
  classType: string;
  suppressible: boolean;
  obsolete: boolean;
  cVMemberCount: number;
  atomCount: number;
  parents: string;
  attributes: string;
  atoms: string;
  relations: string;
}

export interface UMLSSearchResultDtoPage {
  page: number;
  page_size: number;
  total: number;
  results: UMLSSearchResultDTO[];
}

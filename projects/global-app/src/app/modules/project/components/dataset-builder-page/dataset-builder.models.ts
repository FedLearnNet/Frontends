import {DataTypeDetailFlatten, DataTypes} from "@global-app/schema/dto/datatype";
import {OntologyNodeDTO} from "@global-app/schema/dto/ontology";
import {StatisticsColumnProfile} from "@global-app/find-data/dto/query-statistics";
import {SelectedDataIdsDTO} from "@shared-lib/modules/data-modeler/dto/data-export.dto";

export interface DatasetSelectionOption {
  key: string;
  selection: SelectedDataIdsDTO;
  dataTypeNode: DataTypeDetailFlatten;
  ontologyNode: OntologyNodeDTO;
  dataTypeName: string;
  dataTypeDescription: string;
  dataTypeId: string;
  dataTypeType?: DataTypes | null;
  ontologyName: string;
  ontologyDescription?: string | null;
  ontologyId: string;
  clinicCount: number;
  querySummary: string;
  queryOperators: string[];
  statisticsProfiles: StatisticsColumnProfile[];
  statisticsClinicCount: number;
  averageMissingRate: number | null;
  averageMean: number | null;
}

export interface DatasetPreviewColumn {
  id: string;
  label: string;
}

export interface DatasetPreviewRow {
  [key: string]: string | number | boolean | null;
}

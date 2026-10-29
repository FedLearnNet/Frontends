import {DEFAULT_DATAMODELER_API_PREFIX} from '@shared-lib/constants/datamodeler.constants';
import {inject, Injectable} from '@angular/core';
import {SelectOption} from '@shared-lib/models';
import {DataTypeOperatorMap, QueryConfig} from '@global-app/find-data/models';
import {QUERY_OPERATOR_OPTIONS_CONFIG} from '@global-app/find-data/configs';
import {isNotEmpty} from '@shared-lib/utils';
import {map} from 'rxjs/operators';
import {Observable} from 'rxjs';
import {QueryDTO} from "@global-app/find-data/dto/query";
import {isLang2Group} from "@global-app/find-data/dto/lang2-query";
import {formatLang2Query} from "@global-app/find-data/helpers/query-tree.serializer";
import {TranslateService} from '@ngx-translate/core';
import {MatSnackBar} from "@angular/material/snack-bar";
import {ApiService} from "@shared-lib/services/api.service";
import {environment} from "@global-app/env/environment";
import {DataTypes} from "@global-app/schema/dto/datatype";

@Injectable({
  providedIn: 'root'
})
export class QueryBuilderService {
  private readonly translate: TranslateService = inject(TranslateService);
  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.globalLearningApiUrl;
  private readonly apiPrefix = environment.datamodelerApiPrefix ?? DEFAULT_DATAMODELER_API_PREFIX;
  private readonly path = 'query';

  private queryOperatorOptionsMap = new Map<DataTypes, DataTypeOperatorMap>();
  // maps the data type type, e.g. datatype.boolean, to the DataTypeOperatorMap object describing
  // the available operators for that datatype.
  // e.g. for any numeric data type >, >= etc are available, while they are not available for
  // strings

  constructor() {
    this.initializeQueryOperatorOptionsMap();

    this.translate.onLangChange.subscribe(() => {
      this.initializeQueryOperatorOptionsMap();
    });
  }

  getQueryAbilityItems(): Observable<QueryConfig[]> {
    return this.apiService.get<QueryConfig[]>(`${this.getBaseUrl()}/queryable`);
  }


  getQueryConfigs(): Observable<QueryConfig[]> {
    return this.getQueryAbilityItems().pipe(
      map(globalSchemaInfo =>
        this.prepareQueryConfigs(globalSchemaInfo)
      )
    );
  }

  prepareQueryConfigs(queryAbilityItems: QueryConfig[]): QueryConfig[] {
    return queryAbilityItems.map(queryAbilityItem => {
      const dataType = queryAbilityItem.dataType.type;
      queryAbilityItem.queryOperatorOption = this.queryOperatorOptionsMap.get(dataType) as DataTypeOperatorMap;
      queryAbilityItem.options = this.getSchemaConfigOptions(this.allowedValuesToSelectOptions(queryAbilityItem.dataType.options), dataType);
      return queryAbilityItem;
    });
  }

  allowedValuesToSelectOptions(allowedValues: string[]): SelectOption[] {
    if (!allowedValues) {
      return [];
    }
    return allowedValues.map(a => ({
      label: a,
      value: a
    }))
  }

  getFormattedQueryString(queryDTO: QueryDTO, queryConfigs: QueryConfig[]): string {
    if (!isLang2Group(queryDTO?.query)) {
      return '';
    }

    return formatLang2Query(queryDTO.query, leaf => {
      const columnName = queryConfigs.find(queryConfig => queryConfig.ontology.id === leaf.ontology_id
        && queryConfig.dataType.id === leaf.data_type_id)?.name;
      return columnName || leaf.ontology_id;
    });
  }

  private initializeQueryOperatorOptionsMap() {
    const translatedOptions: DataTypeOperatorMap[] = QUERY_OPERATOR_OPTIONS_CONFIG.map(option => ({
      ...option,
      description: this.translate.instant(`QUERY_OPTIONS.${option.type}.DESCRIPTION`),
      options: option.options.map(opt => ({
        ...opt,
        label: this.translate.instant(`QUERY_OPTIONS.${option.type}.${opt.value}`)
      }))
    }));
    this.queryOperatorOptionsMap.clear();
    translatedOptions.forEach(option => {
      this.queryOperatorOptionsMap.set(option.type, option);
    });
  }

  private getSchemaConfigOptions(options: SelectOption[] | undefined, queryOptionType: DataTypes): SelectOption[] {
    if (options && isNotEmpty(options)) {
      return options;
    }

    return queryOptionType === DataTypes.BOOLEAN ? this.getBooleanOptions() : []
  }

  private getBooleanOptions(): SelectOption[] {
    return [
      {label: this.translate.instant('TRUE'), value: true},
      {label: this.translate.instant('FALSE'), value: false},
    ];
  }


  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.apiPrefix}/${this.path}`;
  }
}

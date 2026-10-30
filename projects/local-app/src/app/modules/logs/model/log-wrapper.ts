import {Signal} from "@angular/core";
import {SortDirection} from "@angular/material/sort";
import {LogPage} from "../dto/page";


export interface LoadLogData {
  sort?: string
  order?: SortDirection
  page?: number
  pageSize?: number
  filters?: string[]
  search?: string,
  patientId?: number | string,
  filter?: string[],
}

export interface LoadLogDataResponse {

  data: Signal<LogPage<any> | undefined>;

  loadData(info: LoadLogData): void;

}

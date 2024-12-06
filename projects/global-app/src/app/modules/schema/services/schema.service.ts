import {inject, Injectable} from '@angular/core';
import {environment} from '@global-app/env/environment';
import {catchError, forkJoin, map, Observable, switchMap, throwError} from 'rxjs';
import {ApiService} from '@shared-lib/services/api.service';
import {Schema, SchemaFieldStructure} from '@shared-lib/models';
import {HttpParams} from "@angular/common/http";
import {SchemaDTO} from "@global-app/schema/dto/schema";
import {DataTypeDTO} from "@global-app/schema/dto/datatype";
import {convertObjectKeysToSnakeCase} from "@shared-lib/utils";
import {MatSnackBar} from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class SchemaService {
  readonly snackBar = inject(MatSnackBar);
  readonly apiService: ApiService = inject(ApiService);
  private readonly apiUrl = environment.datamodelerApiUrl;
  private readonly path = 'schema';


  getAllSchemasHead(ontologyId?: string): Observable<Schema[]> {
    let queryParam = new HttpParams();
    if (ontologyId) {
      queryParam = queryParam.set('ontologyId', ontologyId)
    }
    return this.apiService.get<Schema[]>(`${this.getBaseUrl()}/get_head/`, queryParam);
  }

  createRoot(name: string, description: string): Observable<SchemaDTO> {
    const schema: SchemaDTO = { name: name, desc: description, type: 'root' };
    return this.apiService.post<DataTypeDTO>(`${this.getBaseUrl()}/create_head/`, convertObjectKeysToSnakeCase(schema)).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to save datatype';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }


  persist(dataType: SchemaDTO): Observable<SchemaDTO> {
    return this.apiService.post<DataTypeDTO>(`${this.getBaseUrl()}/`, convertObjectKeysToSnakeCase(dataType)).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to save datatype';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  update(dataType: SchemaDTO): Observable<SchemaDTO> {
    return this.apiService.put<DataTypeDTO>(`${this.getBaseUrl()}/${dataType.uniqueId}/`,
      convertObjectKeysToSnakeCase(dataType)).pipe(
      catchError((err) => {
        const errorMessage = JSON.stringify(err.error) || 'Failed to update datatype';
        this.snackBar.open(errorMessage, 'Close', {duration: 5000});
        return throwError(() => err);
      }));
  }

  getSubStructure(schemaId?: string): Observable<SchemaDTO> {
    return this.apiService.get<SchemaDTO>(`${this.getBaseUrl()}/${schemaId}/retrieve_sub_structure/`);
  }


  getSchemaDynamicConfig(schemaId: string): Observable<Schema> {
    return this.apiService.get<Schema>(`${this.getBaseUrl()}/${schemaId}/retrieve_dyn_form/`);
  }

  getAllSchemasConfig(): Observable<SchemaFieldStructure[]> {
    return this.getAllSchemasHead().pipe(
      switchMap(response => {
        const schemaUniqueIds = response.map(schema => schema.uniqueId);

        const schemaObservables = schemaUniqueIds.map(schemaUniqueId =>
          this.getSchemaDynamicConfig(schemaUniqueId!)
        );

        return forkJoin(schemaObservables).pipe(
          map(schemas => {
            let dynamicConfigAttributes: SchemaFieldStructure[] = [];
            schemas.forEach(schema => {
              dynamicConfigAttributes = dynamicConfigAttributes.concat(this.getDynamicConfigAttributes(schema.fields));
            });

            return this.filterUniqueAttributes(dynamicConfigAttributes);
          })
        );
      })
    );
  }

  private getBaseUrl(): string {
    return `${this.apiUrl}/${this.path}`;
  }

  private getDynamicConfigAttributes(dynamicFields: SchemaFieldStructure[]): SchemaFieldStructure[] {
    let dynamicConfigAttributes: SchemaFieldStructure[] = [];

    dynamicFields.forEach(dynamicField => {
      if (dynamicField.nodeType === 'attribute') {
        dynamicConfigAttributes.push(dynamicField);
      }

      dynamicConfigAttributes = dynamicConfigAttributes.concat(this.getDynamicConfigAttributes(dynamicField.fields ?? []));
    });


    return dynamicConfigAttributes;
  }

  private filterUniqueAttributes(schemaFieldStructures: SchemaFieldStructure[]): SchemaFieldStructure[] {
    const uniqueMap = new Map<string, SchemaFieldStructure>();

    schemaFieldStructures.forEach(schemaFieldStructure => {
      uniqueMap.set(schemaFieldStructure.ontologyId, schemaFieldStructure);
    });

    return Array.from(uniqueMap.values());
  }
}

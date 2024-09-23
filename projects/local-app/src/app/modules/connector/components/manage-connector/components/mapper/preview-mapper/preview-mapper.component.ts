import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ConnectorMappingElement} from "../../../../../models/connector-preview";
import {Schema, SchemaFieldStructure} from "@shared-lib/models";

@Component({
  selector: 'app-preview-mapper',
  templateUrl: './preview-mapper.component.html',
  styleUrls: ['./preview-mapper.component.scss']
})
export class ConnectorPreviewMapperComponent implements OnInit, OnChanges {
  @Input() schema: Schema;
  @Input() mappingConfig: ConnectorMappingElement[];

  filterReq: string[] = [];
  filterMapped: string[] = [];

  ngOnInit(): void {
    this.enrichSchemaFields();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes && (changes["schema"]?.currentValue || changes["mappingConfig"]?.currentValue)) {
      this.enrichSchemaFields();
    }
  }

  setFieldValue(fields: SchemaFieldStructure[], pathParts: string[], value: any): boolean {
    const [currentPart, ...remainingParts] = pathParts;
    for (const field of fields) {
      if (field.name === currentPart) {
        if (remainingParts.length === 0) {
          field.value = value;
          return true;
        } else if (field.fields) {
          if (this.setFieldValue(field.fields, remainingParts, value)) {
            return true;
          }
        }
      }
    }
    return false;
  }

  enrichSchemaFields(): void {
    if (this.schema && this.mappingConfig) {
      this.mappingConfig.forEach(el => {
        if (!el.mappingConfig || !el.data) {
          return;
        }
        const pathParts = el.mappingConfig!.value.split('.');
        this.setFieldValue(this.schema.fields, pathParts, el.data);
      });
    }
  }

  isRequiredField(field: SchemaFieldStructure): boolean {
    if (field.validations) {
      return field.validations.some(validation => validation.validator === 'required');
    }
    return false;
  }


  filterFields(field: SchemaFieldStructure): boolean {
    if(!field) {
      return false;
    }
    if (this.filterMapped.length === 0 && this.filterReq.length === 0) {
      return true;
    }
    const showReq = this.filterOnlyRequiredFields(field)
    const showMapped = this.filterOnlyMappedFields(field);
    return showReq && showMapped;
  }

  filterOnlyMappedFields(field: SchemaFieldStructure): boolean {
    let show = true;
    const hasNoValue = field.value == undefined;
    if (this.filterMapped.length === 0) {
      return true;
    }
    if(field.fields && field.fields.length > 0) {
      const showChildren = field.fields.some(child => this.filterOnlyMappedFields(child));
      if(showChildren) {
        return true;
      }
    }
    if (this.filterMapped.includes("Mapped")) {
      show = !hasNoValue;
    }
    if (this.filterMapped.includes("Unmapped")) {
      show = show && hasNoValue;
    }
    return show;

  }

  filterOnlyRequiredFields(field: SchemaFieldStructure): boolean {
    let show = true;
    if (this.filterReq.length === 0) {
      return true;
    }
    const isReq = this.isRequiredField(field);
    if (this.filterReq.includes("Required")) {
      show = isReq;
    }
    if (this.filterReq.includes("NotRequired")) {
      show = show && !isReq;
    }
    return show;
  }


}

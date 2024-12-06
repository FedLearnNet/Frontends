import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input, OnChanges,
  OnInit,
  Output, SimpleChanges
} from '@angular/core';
import {DataTypeService} from "@global-app/schema/services/datatype.service";
import {QueryService} from "@global-app/find-data/services/query.service";
import {DataTypeSubscriptionDTO} from "@global-app/schema/dto/datatype";
import {ProjectService} from "@global-app/project/services/project-service";
import {ProjectDto} from "@global-app/project/dto/project";


@Component({
  selector: 'app-create-datasets',
  templateUrl: './create-datasets.component.html',
  styleUrl: './create-datasets.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDatasetsComponent implements OnInit, OnChanges {
  private readonly projectService: ProjectService = inject(ProjectService);

  private readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly dataTypeService: DataTypeService = inject(DataTypeService);
  private readonly queryService: QueryService = inject(QueryService);

  @Input() project: ProjectDto;
  @Output() projectChange: EventEmitter<ProjectDto> = new EventEmitter<ProjectDto>();

  dataTypes: DataTypeSubscriptionDTO[] = [];
  dataTypesIds: string[] = [];

  loaded: boolean = false;

  ngOnInit() {
    if (!this.project.queryId) {
      return;
    }
    this.queryService.get(this.project.queryId).subscribe(query => {

      const ontologyIds: string[] = query.query.map(q => q.ontologyId);
      this.dataTypeService.getAllForQuery(ontologyIds).subscribe(dataTypes => {
        this.dataTypes = dataTypes;
        this.dataTypesIds = dataTypes.map(dt => dt.dataTypeId);
        this.loaded = true;
        this.cdr.detectChanges();
      })
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["project"] && !changes["project"].firstChange) {
      this.project = changes["project"].currentValue;
    }
  }


  save() {
    this.projectService.updateProject(this.project).subscribe(
      (p) => {
        this.project = p;
        this.projectChange.emit(this.project);
      }
    );
  }
}

import {Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Observable} from "rxjs";
import {ProjectDto} from "../../../../dto/project";
import {FormControl, Validators} from "@angular/forms";
import {ProjectService} from "@global-app/project/services/project-service";

@Component({
  selector: 'app-detail-project-overview',
  templateUrl: './detail-project-overview.component.html',
  styleUrl: './detail-project-overview.component.scss'
})
export class DetailProjectOverviewComponent implements OnInit, OnChanges {
  private readonly projectService: ProjectService = inject(ProjectService);
  @Input() project: ProjectDto;
  @Output() projectChange: EventEmitter<ProjectDto> = new EventEmitter<ProjectDto>();

  readonly name = new FormControl('', [Validators.required]);
  readonly description = new FormControl('', [Validators.required]);

  queryId?: number

  editModeName: boolean = false;
  editModeDescription: boolean = false;

  ngOnInit() {
    if (!this.project) {
      return;
    }
    this.initProject();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["project"] && !changes["project"].firstChange) {
      this.project = changes["project"].currentValue;
      this.initProject();
    }
  }

  initProject(): void {
    this.queryId = this.project.queryId;
    this.name.setValue(this.project.name);
    this.name.disable();
    this.description.setValue(this.project.description);
    this.description.disable();
  }

  onEditName(event: MouseEvent): void {
    event.stopPropagation();
    this.editModeName = true;
    this.name.enable();
  }

  onSaveName(event: MouseEvent): void {
    if (this.name.invalid) {
      return;
    }

    event.stopPropagation();
    this.editModeName = false;
    this.save();
    this.name.disable();
  }

  onEditDescription(event: MouseEvent): void {
    event.stopPropagation();
    this.editModeDescription = true;
    this.description.enable();
  }

  onSaveDescription(event: MouseEvent): void {
    event.stopPropagation();
    if (this.description.invalid) {
      return;
    }

    this.editModeDescription = false;
    this.save();
    this.description.disable();
  }

  save(): void {
    this.project.name = this.name.value!;
    this.project.description = this.description.value!;
    this.project.queryId = this.queryId;
    this.projectService.updateProject(this.project).subscribe(
      (p) => {
        this.project = p;
        this.projectChange.emit(this.project);
      }
    );
  }
}

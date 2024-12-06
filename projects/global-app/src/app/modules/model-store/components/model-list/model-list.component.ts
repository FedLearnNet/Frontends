import {Component, HostListener, inject, Input, OnInit, Output} from '@angular/core';
import { MatButtonModule, MatIconButton} from "@angular/material/button";
import { MatCheckboxModule} from "@angular/material/checkbox";
import { MatDividerModule} from "@angular/material/divider";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatInputModule} from "@angular/material/input";
import {MatRadioModule} from "@angular/material/radio";
import {CommonModule} from "@angular/common";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {Observable} from "rxjs";
import {ModelDto} from "@global-app/model-store/dto/model";
import {ModelService} from "@global-app/model-store/services/model.service";
import {ModelCardComponent} from "@global-app/model-store/components/model-card/model-card.component";
import {SharedLibModule} from "@shared-lib/shared-lib.module";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-model-list',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatDividerModule,
    MatFormFieldModule,
    MatIconModule,
    MatIconButton,
    MatInputModule,
    MatRadioModule,
    ReactiveFormsModule,
    FormsModule,
    ModelCardComponent,
    SharedLibModule
  ],
  templateUrl: './model-list.component.html',
  styleUrl: './model-list.component.scss'
})
export class ModelListComponent implements OnInit {
  private readonly modelService: ModelService = inject(ModelService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);

  private modelsOg: ModelDto[] = [];
  public models: ModelDto[] = [];

  isMobile: boolean = false;
  isMobileFilterActive: boolean = false;

  searchQuery: string = '';


  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.isMobile = window.innerWidth <= 768;
  }

  ngOnInit() {
    this.isMobile = window.innerWidth <= 768;

    this.activatedRoute.data.subscribe(({models}) => {
      this.modelsOg = models;
      this.models = this.modelsOg;
    });
  }

  toggleMobileFilter() {
    this.isMobileFilterActive = !this.isMobileFilterActive;
  }

  clearSearchQuery() {
    this.searchQuery = '';
    this.modelFiltered();
  }

  public modelFiltered() {
    this.models = this.modelsOg
      .filter((app) => this.searchFilter(app));
  }


  private searchFilter(model: ModelDto): boolean {
    const filter = this.searchQuery.trim().toLowerCase();
    return (model.name.toLowerCase().includes(filter)) ||
      (model.shortDescription.toLowerCase().includes(filter)) ||
      (model.longDescription.toLowerCase().includes(filter)) ||
      (model.federatedApp.name.toLowerCase().includes(filter)) ||
      (model.federatedApp.shortDescription.toLowerCase().includes(filter)) ||
      (model.federatedApp.longDescription.toLowerCase().includes(filter));
  }
}

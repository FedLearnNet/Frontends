import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {ConnectorCard} from "../../models/connector-card";
import {ConnectorStepConfigs} from "../../enum/connector-step-config";
import {ConnectorStepConfigChangeEmitter} from "../../models/connector-step-config";
import {configToCards, ConnectorConfig} from "../../models/connector-config";
import {ConnectorStepConfigComponent} from "./components/config/config.component";
import {CdkDragDrop, moveItemInArray, transferArrayItem} from "@angular/cdk/drag-drop";
import {cloneDeep, random} from "lodash";
import {MatDialog} from "@angular/material/dialog";
import {
  ConnectorTransformerFunctionManagerComponent
} from "./components/function/transformer-manager/transformer-manager.component";
import {FunctionService} from "../../services/function.service";
import {FunctionsDetailDTO, functionToDetailCard} from "../../dto/function";
import {ConnectorPreviewService} from "../../services/connector-preview.service";
import {ConnectorMappingConfig} from "../../models/connector-model";
import {ManageConnectorSaveDialogComponent} from "./components/save-dialog/save-dialog.component";
import {ConnectorService} from "../../services/connector-crud.service";
import {ActivatedRoute, Data, Router} from "@angular/router";
import {ConnectorManagementMode} from "../../enum/connector-managment-mode";

const MAPPING_CARD: ConnectorCard =
  {
    index: 99, title: 'Mapper', content: 'Map to Schema',
    step: ConnectorStepConfigs.MAPPER, type: 'MAPPING'
  };


type RouteData = Data & { breadcrumb: string | any, mode: ConnectorManagementMode, connector: ConnectorConfig }


@Component({
  selector: 'app-manage-connector',
  templateUrl: './manage-connector.component.html',
  styleUrl: './manage-connector.component.scss'
})
export class ManageConnectorComponent implements OnInit {
  @Input() schemaId: string;
  @ViewChild('configComponent') configComponent: ConnectorStepConfigComponent;

  baseRoute = 'connector';

  constructor(public dialog: MatDialog,
              private functionService: FunctionService,
              private activatedRoute: ActivatedRoute,
              private connectorPreviewService: ConnectorPreviewService,
              private connectorService: ConnectorService,
              private router: Router) {
  }

  functions: FunctionsDetailDTO[] = [];
  transformer = new Map<string, FunctionsDetailDTO>()
  transformedData = new Map<string, any[]>()
  disableAddTransformer = false;

  toolbarManagement: {
    showToolbar: boolean;
    showSaveButton: boolean;
  } = {
    showToolbar: false,
    showSaveButton: false
  }

  cards: ConnectorCard[] = [
    {
      index: 0, title: 'Source', content: 'Select a Data Source',
      step: ConnectorStepConfigs.STEP_SOURCE_CONFIG, type: 'CONFIG'
    },
  ];
  currentStep: ConnectorCard = this.cards[0];
  _config: ConnectorConfig = {};

  get config(): ConnectorConfig {
    return this._config;
  }

  set config(value: ConnectorConfig) {
    this._config = value;
    this.saveConfigToLocalStorage();
  }

  ngOnInit(): void {
    this.baseRoute = "cohort/" + this.schemaId + "/connector";

    this.functionService.getAllFunctionsDetails().subscribe(data => {
      this.functions = data;
    });
    this.activatedRoute.data.subscribe(data => {
      const routeData = data as RouteData;
      if (routeData.mode === ConnectorManagementMode.EDIT) {
        this._config = routeData.connector;
        this.saveConfigToLocalStorage();
      }
      if (routeData.mode === ConnectorManagementMode.DUPLICATE) {
        this._config = routeData.connector;
        this._config.id = undefined;
        this.saveConfigToLocalStorage();
      }
      if (routeData.mode !== ConnectorManagementMode.EMPTY && routeData.mode !== ConnectorManagementMode.CLEAR) {
        this.loadConfigFromLocalStorage();
        this.loadTransformers(this._config.transformer)
      }
      if (routeData.mode === ConnectorManagementMode.CLEAR) {
        localStorage.removeItem(this.getStorageName());
        this.router.navigate([this.baseRoute, 'new']);
      }
    });
  }

  private getStorageName(): string {
    return 'connectorConfig' + this.schemaId;
  }

  private saveConfigToLocalStorage(): void {

    localStorage.setItem(this.getStorageName(), JSON.stringify(this._config));
  }

  private loadConfigFromLocalStorage(): void {
    const storedConfig = localStorage.getItem(this.getStorageName());
    if (storedConfig) {
      this._config = JSON.parse(storedConfig);
      this.cards = configToCards(this._config);
      if (this.cards.length > 1) {
        this.currentStep = this.cards[this.cards.length - 1];
        this.toolbarManagement.showToolbar = true;
      }
    }
  }

  private loadTransformers(transformers?: FunctionsDetailDTO[]): void {
    if (!transformers) {
      return;
    }
    transformers.forEach((transformer, index) => {
      this.transformer.set(index.toString(), transformer);
    });
    this.applyTransform();
  }

  public configChanged(event: ConnectorStepConfigChangeEmitter) {
    if (event.step === ConnectorStepConfigs.STEP_SOURCE_CONFIG && event.data.inputSource) {
      this.toolbarManagement.showToolbar = true;
      this.config = event.data;
      const name: string = this.config.inputSource!.title;
      this.cards[0].content = name
      const newCard: ConnectorCard = {
        index: 1, title: name + " Settings",
        content: 'Need to be configured', step: this.config.inputSource!.configName,
        type: 'CONFIG'
      };
      if (this.cards.length > 1) {
        this.cards[1] = newCard;
      } else {
        this.cards.push(newCard);
      }
      this.currentStep = this.cards[1];
    }
    this.reAssignIndex();
    this.saveConfigToLocalStorage();
  }

  public onCardClick(card: ConnectorCard) {
    this.currentStep = {...card};
    this.saveConfigToLocalStorage();
  }

  public hasContinueElements(): boolean {
    return this.configComponent !== undefined;
  }

  public onContinueClick() {
    if (this.hasContinueElements() && this.configComponent.onContinueClick()) {
      if (this.currentStep.step === ConnectorStepConfigs.STEP_SOURCE_FILE_CONFIG) {
        const name: string | undefined = this.config.inputConfig?.fileType;
        this.cards[1].content = "FileType: " + (name ?? "Unknown");
        const newCard: ConnectorCard = {
          index: 2, title: " Specify Headers",
          content: 'Need to be configured', step: ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG,
          type: 'CONFIG'
        };
        if (this.cards.length > 1) {
          this.cards[2] = newCard;
        } else {
          this.cards.push(newCard);
        }
        this.currentStep = this.findCard(this.currentStep.index + 1);
      } else if (this.currentStep.step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG) {
        this.addTransform()
      }
    }
    this.reAssignIndex();
    this.saveConfigToLocalStorage();
  }

  drop(event: CdkDragDrop<ConnectorCard[]>) {
    const currentConfigCount = this.getConfigCards().length;
    const prevIndex = event.previousIndex + currentConfigCount;
    const currentIndex = event.currentIndex + currentConfigCount;
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, prevIndex, currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        prevIndex,
        currentIndex,
      );
    }
    this.reAssignIndex();
    this.applyTransform();
  }

  public reAssignIndex() {
    this.cards.forEach((card, index) => {
      card.index = index;
    });
  }

  public getLatestColumns(): string[] {
    if (this.transformedData.size > 0) {
      const latestData = this.getTransformedData();
      if (latestData.length > 0 && latestData[0]) {
        return Object.keys(latestData[0]);
      }
    }
    return this.config.fileInfo?.columns || [];
  }

  public getLatestData(): any[] {
    if (this.transformedData.size > 0) {
      return this.getTransformedData();
    }
    return this.config.fileInfo?.data || [];
  }

  public onEditTransformer(card: ConnectorCard) {
    const dialogRef = this.dialog.open(ConnectorTransformerFunctionManagerComponent, {
      minWidth: '600px',
      maxWidth: '800px',
      data: {
        functions: this.functions,
        columns: this.getLatestColumns(),
        data: this.transformer.get(card.id!)
      }
    });

    dialogRef.afterClosed().subscribe((result: FunctionsDetailDTO | { delete: boolean }) => {
      if (!result) {
        return;
      }
      if ('delete' in result) {
        this.cards = this.cards.filter(c => c.id !== card.id);
        this.disableAddTransformer = false;
        if (this.transformer.has(card.id!)) {
          this.transformer.delete(card.id!);
          this.transformedData.delete(card.id!);
          this.currentStep = this.findCard(this.currentStep.index + 1);
          this.reAssignIndex();
          this.applyTransform();
        }
        return;
      }
      this.transformer.set(card.id!, result);
      this.cards[card.index].title = result.methodName;
      this.cards[card.index].content = functionToDetailCard(result);
      this.disableAddTransformer = false;
      this.applyTransform();
    });

  }

  public addTransform() {
    if (this.cards.length > 1 && this.cards[this.cards.length - 1].step === ConnectorStepConfigs.STEP_SPECIFY_SELECTORS_CONFIG) {
      this.cards[this.cards.length - 1].content = 'Configured';
    }
    const r = random(0, 100000, false)
    const newCard: ConnectorCard = {
      index: this.cards.length, title: "Transformer",
      content: 'Need to be configured', step: ConnectorStepConfigs.TRANSFORM,
      type: 'TRANSFORM', id: r.toString()
    };
    this.cards.push(newCard);
    this.onEditTransformer(newCard);
    this.disableAddTransformer = true;
    this.currentStep = this.findCard(this.currentStep.index + 1);
  }

  public applyTransform() {
    const config = cloneDeep(this.config)
    const transFormerCards = this.getTransformCards();
    this.connectorPreviewService.preview(transFormerCards, config, this.transformer, this.schemaId).subscribe(data => {
      this.transformedData = data;
    });
    this.saveConfigToLocalStorage();
  }

  public onBackClick() {
    this.currentStep = this.findCard(this.currentStep.index - 1);
  }

  public getConfigCards(): ConnectorCard[] {
    return this.cards.filter(card => card.type === 'CONFIG');
  }

  public getTransformCards(): ConnectorCard[] {
    return this.cards.filter(card => card.type === 'TRANSFORM');
  }

  public getTransformer(): FunctionsDetailDTO | undefined {
    if (!this.currentStep.id) {
      return;
    }
    return this.transformer.get(this.currentStep.id);

  }

  public getTransformedColumns(): string[] {
    const transformer = this.getTransformer();
    if (!transformer) {
      return [];
    }
    if (transformer.onRow) {
      if (transformer.returnMapping === undefined) {
        return [];
      }
      const map = new Map<string, string>(Object.entries(transformer.returnMapping));
      return Array.from(map.values());
    }
    return transformer.column?.split(',') || [];
  }

  public getTransformedData(): any[] {
    const columnsLength = this.config.fileInfo?.columns.length || 0;
    const defaultData = Array(columnsLength)
    const latestId = this.getTransformCards()[this.getTransformCards().length - 1]?.id;
    if (!latestId) {
      return defaultData;
    }
    if (!this.transformedData.has(latestId)) {
      return defaultData;
    }
    return this.transformedData.get(latestId)!;
  }

  public getMappingCards(): ConnectorCard[] {
    const mappingCard = MAPPING_CARD;
    mappingCard.index = this.cards.length;
    return [mappingCard];
  }

  private findCard(index: number): ConnectorCard {
    return this.cards.find(card => card.index === index)!;
  }

  public onMappingChange(config: ConnectorMappingConfig[]) {
    this.config.schemaMapping = config;
  }

  public onMappingCardContentChange(content: string) {
    MAPPING_CARD.content = content;
  }

  public onClearClick() {
    this.router.navigate([this.baseRoute, 'new', 'clear']);
  }

  public onCancelClick() {
    this.router.navigate([this.baseRoute]);
  }

  public saveConfig(navigate: boolean = false) {
    this._config.transformer = Array.from(this.transformer.values());
    console.log(this.config);

    const name = this.config.name;
    const description = this.config.description;

    if (!name || !description) {
      const dialogRef = this.dialog.open(ManageConnectorSaveDialogComponent, {
        data: {name: name, description: description},
      });

      this.config.schemaId = this.schemaId;

      dialogRef.afterClosed().subscribe(result => {
        this.config.name = result.name;
        this.config.description = result.description;
        this.saveConfigToLocalStorage();
        this.connectorService.save(this.config).subscribe(data => {
          this.config.id = data.id;
          this.saveConfigToLocalStorage();
          if (navigate) {
            this.navigateToView(data.id!);
          }
        });
      });
    } else {
      this.connectorService.save(this.config).subscribe(data => {
        console.log(data);
        this.config.id = data.id;
        if (navigate) {
          this.navigateToView(data.id!);
        }
        this.saveConfigToLocalStorage();
      });
    }
  }

  public navigateToView(id: number) {
    this.router.navigate([this.baseRoute, 'view', id]);
  }
}

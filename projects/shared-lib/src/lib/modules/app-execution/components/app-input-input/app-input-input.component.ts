import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges
} from '@angular/core';
import {MatInputModule} from "@angular/material/input";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormFieldModule} from "@angular/material/form-field";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatSelectModule} from "@angular/material/select";
import {MatCheckboxModule} from "@angular/material/checkbox";
import {MatTooltipModule} from "@angular/material/tooltip";
import {ConfigInputEditModel} from "@shared-lib/modules/app-execution/model/config";
import {TranslatePipe} from "@ngx-translate/core";
import {DragAndDropFileComponent} from "@shared-lib/components/drag-and-drop-file/drag-and-drop-file.component";
import {ToolConfigDataType} from "@shared-lib/modules/app-execution/dto/config";

@Component({
  selector: 'lib-app-input-input',
  imports: [
    ReactiveFormsModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule,
    MatSelectModule,
    MatCheckboxModule,
    TranslatePipe,
    DragAndDropFileComponent,
  ],
  templateUrl: './app-input-input.component.html',
  styleUrl: './app-input-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppInputInputComponent implements OnInit, OnChanges {
  protected readonly cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  protected readonly ToolConfigDataType = ToolConfigDataType;

  inputModel = input.required<ConfigInputEditModel>();
  label = input<string>();
  showTooltip = input<boolean>(false);
  value = input<string>();

  valueChanged = output<string>();
  valuesChanged = output<string[]>();
  validChanged = output<boolean>();

  parsedLabel = signal<string | undefined>(this.label());
  formControl = new FormControl('', [Validators.required]);
  private firstVisit: boolean = true;

  ngOnChanges(changes: SimpleChanges) {
    if (changes["inputModel"] && !this.firstVisit) {
      this.setup();
    }
  }

  ngOnInit(): void {
    this.setup();
    this.firstVisit = false;
  }

  setup(): void {
    if (!this.label()) {
      this.parsedLabel.set(this.inputModel().name);
    }
    if (this.value()) {
      this.formControl.setValue(this.value()!);
    }
    // Publish value on form edit
    this.formControl.valueChanges.subscribe(() => {
      this.publishValue();
    });
    this.publishValue();
    this.cdr.detectChanges();
  }

  publishValue() {
    if (this.formControl.invalid) {
      this.cdr.detectChanges();
      this.validChanged.emit(false);
      return;
    }
    this.valueChanged.emit(this.formControl.value!);
    this.validChanged.emit(true);
  }
}


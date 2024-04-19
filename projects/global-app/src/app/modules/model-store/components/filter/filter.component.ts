import { Component, Output, EventEmitter } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  searchByForm = this.formBuilder.group({
    name: [''],
    inputData: [''],
    predictedConcept: [''],
  });

  @Output() onFilterChange = new EventEmitter<any>();

  constructor(
      private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.detectSearchByFormChange();
  }

  detectSearchByFormChange(): void {
    this.searchByForm.valueChanges.subscribe(value => this.onFilterChange.emit(value));
  }

  clearFormValue(formControlName: string): void {
    this.searchByForm.get(formControlName)?.reset();
  }
}

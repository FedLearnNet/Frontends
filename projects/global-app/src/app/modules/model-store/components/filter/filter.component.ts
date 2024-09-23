import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnInit {
  searchByForm = this.formBuilder.group({
    name: [''],
    inputData: [''],
    predictedConcept: [''],
  });

  @Output() filterChange = new EventEmitter<any>();

  constructor(
      private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.detectSearchByFormChange();
  }

  detectSearchByFormChange(): void {
    this.searchByForm.valueChanges.subscribe(value => this.filterChange.emit(value));
  }

  clearFormValue(formControlName: string): void {
    this.searchByForm.get(formControlName)?.reset();
  }
}

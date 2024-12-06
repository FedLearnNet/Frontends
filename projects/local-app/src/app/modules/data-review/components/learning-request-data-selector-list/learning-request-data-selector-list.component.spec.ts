import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LearningRequestDataSelectorListComponent } from './learning-request-data-selector-list.component';

describe('LearningRequestDataSelectorListComponent', () => {
  let component: LearningRequestDataSelectorListComponent;
  let fixture: ComponentFixture<LearningRequestDataSelectorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LearningRequestDataSelectorListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LearningRequestDataSelectorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

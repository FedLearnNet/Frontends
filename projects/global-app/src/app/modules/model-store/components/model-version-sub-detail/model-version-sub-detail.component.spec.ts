import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelVersionSubDetailComponent } from './model-version-sub-detail.component';

describe('ModelVersionSubDetailComponent', () => {
  let component: ModelVersionSubDetailComponent;
  let fixture: ComponentFixture<ModelVersionSubDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelVersionSubDetailComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelVersionSubDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

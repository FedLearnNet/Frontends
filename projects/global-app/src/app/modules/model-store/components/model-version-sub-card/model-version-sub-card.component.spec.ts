import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelVersionSubCardComponent } from './model-version-sub-card.component';

describe('ModelVersionSubCardComponent', () => {
  let component: ModelVersionSubCardComponent;
  let fixture: ComponentFixture<ModelVersionSubCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelVersionSubCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelVersionSubCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

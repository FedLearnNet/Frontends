import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelHeaderComponent } from './model-header.component';

describe('ModelHeaderComponent', () => {
  let component: ModelHeaderComponent;
  let fixture: ComponentFixture<ModelHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

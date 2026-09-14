import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppRunTransformerRowMappingComponent } from './app-run-transformer-row-mapping.component';

describe('AppRunTransformerRowMappingComponent', () => {
  let component: AppRunTransformerRowMappingComponent;
  let fixture: ComponentFixture<AppRunTransformerRowMappingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunTransformerRowMappingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppRunTransformerRowMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

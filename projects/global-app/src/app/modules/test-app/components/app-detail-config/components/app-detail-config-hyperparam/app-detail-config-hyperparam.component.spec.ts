import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigHyperparamComponent } from './app-detail-config-hyperparam.component';

describe('AppDetailConfigHyperparamComponent', () => {
  let component: AppDetailConfigHyperparamComponent;
  let fixture: ComponentFixture<AppDetailConfigHyperparamComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigHyperparamComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigHyperparamComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

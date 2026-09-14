import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigComponent } from './app-detail-config.component';

describe('AppDetailConfigComponent', () => {
  let _component: AppDetailConfigComponent;
  let fixture: ComponentFixture<AppDetailConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});

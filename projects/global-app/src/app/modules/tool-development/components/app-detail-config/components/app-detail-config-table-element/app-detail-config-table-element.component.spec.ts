import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppDetailConfigTableElementComponent } from './app-detail-config-table-element.component';

describe('AppDetailConfigTableElementComponent', () => {
  let component: AppDetailConfigTableElementComponent;
  let fixture: ComponentFixture<AppDetailConfigTableElementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppDetailConfigTableElementComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppDetailConfigTableElementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

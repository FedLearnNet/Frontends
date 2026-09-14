import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppListComponent } from './app-list.component';

describe('AppListComponent', () => {
  let _component: AppListComponent;
  let fixture: ComponentFixture<AppListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppListComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});

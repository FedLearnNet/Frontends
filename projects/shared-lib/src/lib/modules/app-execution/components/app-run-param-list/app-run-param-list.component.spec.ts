import {ComponentFixture, TestBed} from '@angular/core/testing';

import {AppRunParamListComponent} from './app-run-param-list.component';

describe('AppRunParamListComponent', () => {
 // let component: AppRunParamListComponent;
  let fixture: ComponentFixture<AppRunParamListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppRunParamListComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(AppRunParamListComponent);
   // component = fixture.componentInstance;
    fixture.detectChanges();
  });
});

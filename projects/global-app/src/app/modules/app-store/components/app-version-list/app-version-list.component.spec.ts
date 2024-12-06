import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppVersionListComponent } from './app-version-list.component';

describe('AppVersionListComponent', () => {
  let component: AppVersionListComponent;
  let fixture: ComponentFixture<AppVersionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppVersionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppVersionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

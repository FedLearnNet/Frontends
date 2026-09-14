import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppCardTagsComponent } from './app-card-tags.component';

describe('AppCardTagsComponent', () => {
  let component: AppCardTagsComponent;
  let fixture: ComponentFixture<AppCardTagsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppCardTagsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppCardTagsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

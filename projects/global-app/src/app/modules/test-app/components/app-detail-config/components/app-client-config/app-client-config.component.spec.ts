import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppClientConfigComponent } from './app-client-config.component';

describe('AppClientConfigComponent', () => {
  let component: AppClientConfigComponent;
  let fixture: ComponentFixture<AppClientConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppClientConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AppClientConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

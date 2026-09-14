import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewAppDialogComponent } from './new-app-dialog.component';

describe('NewAppDialogComponent', () => {
  let component: NewAppDialogComponent;
  let fixture: ComponentFixture<NewAppDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewAppDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NewAppDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

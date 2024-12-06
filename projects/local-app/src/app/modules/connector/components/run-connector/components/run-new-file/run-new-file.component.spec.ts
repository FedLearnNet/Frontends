import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunNewFileComponent } from './run-new-file.component';

describe('RunNewFileComponent', () => {
  let component: RunNewFileComponent;
  let fixture: ComponentFixture<RunNewFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RunNewFileComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunNewFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

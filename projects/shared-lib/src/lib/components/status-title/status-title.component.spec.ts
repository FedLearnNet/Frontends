import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusTitleComponent } from './status-title.component';

describe('StatusTitleComponent', () => {
  let component: StatusTitleComponent;
  let fixture: ComponentFixture<StatusTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusTitleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatusTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

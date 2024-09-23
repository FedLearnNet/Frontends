import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputFtpComponent } from './input-ftp.component';

describe('InputFtpComponent', () => {
  let component: InputFtpComponent;
  let fixture: ComponentFixture<InputFtpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputFtpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(InputFtpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

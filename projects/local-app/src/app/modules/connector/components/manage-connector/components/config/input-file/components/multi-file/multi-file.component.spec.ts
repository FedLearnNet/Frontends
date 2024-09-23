import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiFileComponent } from './multi-file.component';

describe('MultiFileComponent', () => {
  let component: MultiFileComponent;
  let fixture: ComponentFixture<MultiFileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultiFileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MultiFileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

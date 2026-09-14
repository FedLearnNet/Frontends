import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolTypeSelectorComponent } from './tool-type-selector.component';

describe('ToolTypeSelectorComponent', () => {
  let component: ToolTypeSelectorComponent;
  let fixture: ComponentFixture<ToolTypeSelectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolTypeSelectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolTypeSelectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

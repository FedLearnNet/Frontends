import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolConfigCardComponent } from './tool-config-card.component';

describe('ToolConfigCardComponent', () => {
  let component: ToolConfigCardComponent;
  let fixture: ComponentFixture<ToolConfigCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolConfigCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolConfigCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

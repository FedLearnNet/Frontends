import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolSlugInputComponent } from './tool-slug-input.component';

describe('ToolSlugInputComponent', () => {
  let component: ToolSlugInputComponent;
  let fixture: ComponentFixture<ToolSlugInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToolSlugInputComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ToolSlugInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

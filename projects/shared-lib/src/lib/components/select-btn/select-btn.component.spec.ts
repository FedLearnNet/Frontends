import {ComponentFixture, TestBed} from '@angular/core/testing';

import {SelectBtnComponent} from './select-btn.component';

describe('SelectBtnComponent', () => {
  let component: SelectBtnComponent;
  let fixture: ComponentFixture<SelectBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [SelectBtnComponent]}).compileComponents();
    fixture = TestBed.createComponent(SelectBtnComponent);
    fixture.componentRef.setInput('title', 'Direct field');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits clicked when enabled', () => {
    const clicked = jasmine.createSpy('clicked');
    component.clicked.subscribe(clicked);
    fixture.nativeElement.querySelector('button').click();
    expect(clicked).toHaveBeenCalled();
  });
});

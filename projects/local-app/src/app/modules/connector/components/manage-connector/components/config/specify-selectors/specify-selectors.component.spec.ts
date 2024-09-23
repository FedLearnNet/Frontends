import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SpecifySelectorsComponent } from './specify-selectors.component';

describe('SpecifySelectorsComponent', () => {
  let component: SpecifySelectorsComponent;
  let fixture: ComponentFixture<SpecifySelectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SpecifySelectorsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SpecifySelectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

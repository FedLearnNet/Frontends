import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UmlsParentGraphComponent } from './umls-parent-graph.component';

describe('UmlsParentGraphComponent', () => {
  let component: UmlsParentGraphComponent;
  let fixture: ComponentFixture<UmlsParentGraphComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UmlsParentGraphComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UmlsParentGraphComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

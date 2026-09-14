import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUMLSComponent } from './list-umls.component';

describe('ListUMLSComponent', () => {
  let _component: ListUMLSComponent;
  let fixture: ComponentFixture<ListUMLSComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUMLSComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUMLSComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

});

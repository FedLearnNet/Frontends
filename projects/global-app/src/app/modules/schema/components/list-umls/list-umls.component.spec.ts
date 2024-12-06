import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListUmlsComponent } from './list-umls.component';

describe('ListUmlsComponent', () => {
  let component: ListUmlsComponent;
  let fixture: ComponentFixture<ListUmlsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListUmlsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListUmlsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDatatypesComponent } from './list-datatypes.component';

describe('ListDatatypesComponent', () => {
  let component: ListDatatypesComponent;
  let fixture: ComponentFixture<ListDatatypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListDatatypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDatatypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

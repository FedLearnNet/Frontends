import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListOntologiesComponent } from './list-ontologies.component';

describe('ListOntologiesComponent', () => {
  let component: ListOntologiesComponent;
  let fixture: ComponentFixture<ListOntologiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListOntologiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListOntologiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

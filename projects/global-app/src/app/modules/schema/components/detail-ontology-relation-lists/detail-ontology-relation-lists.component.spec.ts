import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailOntologyRelationListsComponent } from './detail-ontology-relation-lists.component';

describe('DetailOntologyRelationListsComponent', () => {
  let component: DetailOntologyRelationListsComponent;
  let fixture: ComponentFixture<DetailOntologyRelationListsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailOntologyRelationListsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailOntologyRelationListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

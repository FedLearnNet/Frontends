import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailOntologyComponent } from './detail-ontology.component';

describe('DetailOntologyComponent', () => {
  let component: DetailOntologyComponent;
  let fixture: ComponentFixture<DetailOntologyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailOntologyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailOntologyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailDatatypeComponent } from './detail-datatype.component';

describe('DetailDatatypeComponent', () => {
  let component: DetailDatatypeComponent;
  let fixture: ComponentFixture<DetailDatatypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailDatatypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailDatatypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

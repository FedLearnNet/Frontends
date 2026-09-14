import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSchemaComponent } from './detail-schema.component';

describe('DetailSchemaComponent', () => {
  let component: DetailSchemaComponent;
  let fixture: ComponentFixture<DetailSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSchemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

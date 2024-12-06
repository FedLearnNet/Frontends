import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailSchemaCardComponent } from './detail-schema-card.component';

describe('DetailSchemaCardComponent', () => {
  let component: DetailSchemaCardComponent;
  let fixture: ComponentFixture<DetailSchemaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailSchemaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailSchemaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchemaCardComponent } from './schema-card.component';

describe('SchemaCardComponent', () => {
  let component: SchemaCardComponent;
  let fixture: ComponentFixture<SchemaCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchemaCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchemaCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

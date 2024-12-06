import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateDatasetsComponent } from './create-datasets.component';

describe('CreateDatasetsComponent', () => {
  let component: CreateDatasetsComponent;
  let fixture: ComponentFixture<CreateDatasetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateDatasetsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateDatasetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

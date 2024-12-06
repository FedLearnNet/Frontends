import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelVersionListComponent } from './model-version-list.component';

describe('ModelVersionListComponent', () => {
  let component: ModelVersionListComponent;
  let fixture: ComponentFixture<ModelVersionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelVersionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelVersionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

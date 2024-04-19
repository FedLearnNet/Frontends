import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelStoreComponent } from './model-store.component';

describe('ModelStoreComponent', () => {
  let component: ModelStoreComponent;
  let fixture: ComponentFixture<ModelStoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModelStoreComponent]
    });
    fixture = TestBed.createComponent(ModelStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

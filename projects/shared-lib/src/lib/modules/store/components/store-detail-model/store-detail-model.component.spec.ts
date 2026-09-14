import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDetailModelComponent } from './store-detail-model.component';

describe('StoreDetailModelComponent', () => {
  let _component: StoreDetailModelComponent;
  let fixture: ComponentFixture<StoreDetailModelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDetailModelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDetailModelComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});

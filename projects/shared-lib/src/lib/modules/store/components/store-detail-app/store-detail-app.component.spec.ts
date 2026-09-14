import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreDetailAppComponent } from './store-detail-app.component';

describe('StoreDetailAppComponent', () => {
  let _component: StoreDetailAppComponent;
  let fixture: ComponentFixture<StoreDetailAppComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreDetailAppComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreDetailAppComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});

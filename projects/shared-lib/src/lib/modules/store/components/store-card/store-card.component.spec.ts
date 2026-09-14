import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreCardComponent } from './store-card.component';

describe('StoreCardComponent', () => {
  let _component: StoreCardComponent;
  let fixture: ComponentFixture<StoreCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreCardComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});

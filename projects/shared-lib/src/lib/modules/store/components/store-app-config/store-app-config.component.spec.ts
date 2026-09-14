import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreAppConfigComponent } from './store-app-config.component';

describe('StoreAppConfigComponent', () => {
  let component: StoreAppConfigComponent;
  let fixture: ComponentFixture<StoreAppConfigComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreAppConfigComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreAppConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

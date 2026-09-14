import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreVersionListComponent } from './store-version-list.component';

describe('StoreVersionListComponent', () => {
  let _component: StoreVersionListComponent;
  let fixture: ComponentFixture<StoreVersionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreVersionListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreVersionListComponent);
    _component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
  });
});

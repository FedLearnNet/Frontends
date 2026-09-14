import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StoreGraphListComponent } from './store-graph-list.component';

describe('StoreGraphListComponent', () => {
  let component: StoreGraphListComponent;
  let fixture: ComponentFixture<StoreGraphListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StoreGraphListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StoreGraphListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

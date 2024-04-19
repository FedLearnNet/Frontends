import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QueryBuilderItemComponent } from './query-builder-item.component';

describe('QueryBuilderItemComponent', () => {
  let component: QueryBuilderItemComponent;
  let fixture: ComponentFixture<QueryBuilderItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QueryBuilderItemComponent]
    });
    fixture = TestBed.createComponent(QueryBuilderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

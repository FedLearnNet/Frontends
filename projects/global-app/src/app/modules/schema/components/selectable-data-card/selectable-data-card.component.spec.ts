import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectableDataCardComponent } from './selectable-data-card.component';

describe('SelectableDataCardComponent', () => {
  //let component: SelectableDataCardComponent;
  let fixture: ComponentFixture<SelectableDataCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectableDataCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectableDataCardComponent);
    //component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    //expect(component).toBeTruthy();
  });
});

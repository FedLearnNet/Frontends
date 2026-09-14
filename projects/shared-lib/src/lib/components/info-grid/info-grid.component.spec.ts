import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoGridComponent } from './info-grid.component';

describe('InfoGridComponent', () => {
  let component: InfoGridComponent;
  let fixture: ComponentFixture<InfoGridComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoGridComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoItemComponent } from './info-item.component';

describe('InfoItemComponent', () => {
  let component: InfoItemComponent;
  let fixture: ComponentFixture<InfoItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

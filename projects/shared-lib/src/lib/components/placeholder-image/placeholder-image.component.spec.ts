import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlaceholderImageComponent } from './placeholder-image.component';

describe('PlaceholderImageComponent', () => {
  let component: PlaceholderImageComponent;
  let fixture: ComponentFixture<PlaceholderImageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlaceholderImageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlaceholderImageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

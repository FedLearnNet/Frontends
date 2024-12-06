import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailProjectOverviewComponent } from './detail-project-overview.component';

describe('DetailProjectOverviewComponent', () => {
  let component: DetailProjectOverviewComponent;
  let fixture: ComponentFixture<DetailProjectOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailProjectOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetailProjectOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

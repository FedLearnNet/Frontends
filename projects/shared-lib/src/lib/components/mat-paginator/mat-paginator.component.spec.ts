import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MatPaginatorComponent } from './mat-paginator.component';

describe('MatPaginatorComponent', () => {
  let component: MatPaginatorComponent;
  let fixture: ComponentFixture<MatPaginatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatPaginatorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MatPaginatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

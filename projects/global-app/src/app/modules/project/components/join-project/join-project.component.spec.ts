import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinProjectComponent } from './join-project.component';

describe('JoinProjectComponent', () => {
  let component: JoinProjectComponent;
  let fixture: ComponentFixture<JoinProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JoinProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JoinProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

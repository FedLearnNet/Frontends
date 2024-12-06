import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyModelListComponent } from './my-model-list.component';

describe('MyModelListComponent', () => {
  let component: MyModelListComponent;
  let fixture: ComponentFixture<MyModelListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyModelListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyModelListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

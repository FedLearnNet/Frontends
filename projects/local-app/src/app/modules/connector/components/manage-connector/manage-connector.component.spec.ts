import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageConnectorComponent } from './manage-connector.component';

describe('ManageConnectorComponent', () => {
  let component: ManageConnectorComponent;
  let fixture: ComponentFixture<ManageConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageConnectorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ManageConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

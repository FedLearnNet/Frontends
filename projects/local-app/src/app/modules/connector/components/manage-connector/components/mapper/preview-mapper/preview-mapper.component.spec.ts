import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectorPreviewMapperComponent } from './preview-mapper.component';

describe('PreviewMapperComponent', () => {
  let component: ConnectorPreviewMapperComponent;
  let fixture: ComponentFixture<ConnectorPreviewMapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectorPreviewMapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectorPreviewMapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

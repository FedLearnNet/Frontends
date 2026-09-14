import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KvComponent } from './kv.component';

describe('KvComponent', () => {
  let component: KvComponent;
  let fixture: ComponentFixture<KvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [KvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(KvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

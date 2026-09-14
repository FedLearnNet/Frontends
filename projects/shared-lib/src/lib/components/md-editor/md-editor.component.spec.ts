import {ComponentFixture, TestBed} from '@angular/core/testing';
import {MarkdownModule} from 'ngx-markdown';
import {MarkDownEditorComponent} from './md-editor.component';

describe('CloseableMdPreviewComponent', () => {
  let component: MarkDownEditorComponent;
  let fixture: ComponentFixture<MarkDownEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [MarkdownModule.forRoot(), MarkDownEditorComponent]
})
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MarkDownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

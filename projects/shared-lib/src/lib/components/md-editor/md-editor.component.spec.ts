import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMarkdown, MarkdownModule } from 'ngx-markdown';
import { MarkDownEditorComponent } from './md-editor.component';

describe('CloseableMdPreviewComponent', () => {
  let component: MarkDownEditorComponent;
  let fixture: ComponentFixture<MarkDownEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarkDownEditorComponent ],
			imports: [MarkdownModule.forRoot()]
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

import {
  AfterViewInit,
  Component,
  DestroyRef,
  effect,
  ElementRef,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MarkdownComponent, MarkdownService, provideMarkdown} from 'ngx-markdown';
import EasyMDE from 'easymde';

@Component({
  selector: 'app-md-editor',
  standalone: true,
  templateUrl: './md-editor.component.html',
  styleUrls: ['./md-editor.component.scss'],
  imports: [MarkdownComponent],
  providers: [
    provideMarkdown(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkDownEditorComponent),
      multi: true,
    },
  ],
})
export class MarkDownEditorComponent implements AfterViewInit, ControlValueAccessor {
  private readonly markdownService: MarkdownService = inject(MarkdownService);
  private readonly destroyRef: DestroyRef = inject(DestroyRef);

  defaultValue = input<string>('');
  toolbar = input<string[]>([
    'bold',
    'italic',
    'strikethrough',
    'heading-1',
    'heading-2',
    'heading-3',
    'code',
    'quote',
    'unordered-list',
    'ordered-list',
    'clean-block',
    'link',
    'image',
    'table',
    'horizontal-rule',
  ]);

  newMarkdownEvent = output<string>();

  readonly markdown = signal<string>('');
  readonly disabled = signal<boolean>(false);

  readonly markdownInput = viewChild<ElementRef<HTMLTextAreaElement>>('markdownInput');

  private editor?: EasyMDE;

  private onChange: (value: string) => void = () => {
  };
  protected onTouched: () => void = () => {
  };

  private isProgrammaticWrite = false;

  ngAfterViewInit(): void {
    const el = this.markdownInput()?.nativeElement;
    if (!el) return;

    this.markdown.set(this.defaultValue() ?? '');

    this.editor = new EasyMDE({
      element: el,
      toolbar: this.toolbar() as any,
      placeholder: 'Type here...',
      unorderedListStyle: '-',
      previewRender: (plainText, preview) => {
        const parsed = this.markdownService.parse(plainText);
        if (parsed instanceof Promise) {
          parsed.then((html) => (preview.innerHTML = html));
          return 'Loading...';
        }
        preview.innerHTML = parsed;
        return parsed;
      },
    });

    this.editor.value(this.markdown());

    const cm = this.editor.codemirror;
    const changeHandler = () => {
      if (!this.editor) return;
      if (this.isProgrammaticWrite) return;

      const val = this.editor.value();
      this.markdown.set(val);
      this.newMarkdownEvent.emit(val);
      this.onChange(val);
    };

    cm.on('change', changeHandler);

    this.destroyRef.onDestroy(() => {
      cm.off('change', changeHandler);
      try {
        this.editor?.toTextArea();
      } catch {
        //ignore
      }
      this.editor = undefined;
    });
  }

  disabled$ = effect(() => {
    const d = this.disabled();
    if (this.editor) this.editor.codemirror.setOption('readOnly', d ? 'nocursor' : false);
  });


  writeValue(obj: unknown): void {
    const next = (obj ?? '') as string;
    this.markdown.set(next);

    if (!this.editor) return;
    if (this.editor.value() === next) return;

    this.isProgrammaticWrite = true;
    try {
      const cm = this.editor.codemirror;
      const cursor = cm.getCursor();
      this.editor.value(next);
      cm.setCursor(cursor);
    } finally {
      this.isProgrammaticWrite = false;
    }
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }
}

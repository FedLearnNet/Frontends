import {
  afterNextRender,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  signal,
  untracked,
  viewChild
} from '@angular/core';
import {LanguagePipe, MarkdownComponent, provideMarkdown} from "ngx-markdown";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import Prism from 'prismjs';
import 'prismjs/components/prism-json';

export type JsonPrimitive = string | number | boolean | null;

export type JsonValue =
  | JsonPrimitive
  | JsonValue[]
  | { [key: string]: JsonValue };

@Component({
  selector: 'lib-json-editor',
  imports: [
    MarkdownComponent,
    FormsModule,
    MatButton,
    LanguagePipe
  ],
  templateUrl: './json-editor.component.html',
  styleUrl: './json-editor.component.scss',
  providers: [
    provideMarkdown()
  ]
})
export class JsonEditorComponent<T = JsonValue> {

  jsonObject = input<T | undefined>(undefined);
  jsonString = input<string | undefined>(undefined);
  editable = input<boolean>(false);
  showToolbar = input<boolean>(false);
  title = input<string>('JSON');

  serialize = input<(value: T) => string>((value) => JSON.stringify(value, null, 2));
  deserialize = input<(text: string) => T>((text) => JSON.parse(text) as T);

  valueChange = output<T>();

  private readonly injector = inject(Injector);
  private readonly textarea = viewChild<ElementRef<HTMLTextAreaElement>>('editorTextarea');

  readonly editorText = signal<string>('');
  private readonly lastLoadedText = signal<string>('');
  readonly mode = computed<'edit' | 'view'>(() => (this.editable() ? 'edit' : 'view'));

  readonly parseError = signal<string | null>(null);
  readonly dirty = computed(() => this.editorText() !== this.lastLoadedText());

  private readonly baseJsonText = computed<string>(() => {
    const str = this.jsonString();
    if (str != null && str.trim().length > 0) return str;

    const obj = this.jsonObject();
    if (obj !== undefined) return this.safeSerialize(obj);

    return '';
  });

  constructor() {
    effect(() => {
      const incoming = this.baseJsonText();
      const editable = this.editable();

      const shouldLoad = !editable || !this.dirty();
      if (!shouldLoad) return;

      untracked(() => {
        this.editorText.set(incoming);
        this.lastLoadedText.set(incoming);
        this.parseError.set(null);

        if (editable && !this.showToolbar()) {
          this.autoApply();
        }
      });
    });
  }

  readonly highlightedJson = computed(() => {
    const t = this.editorText() ?? '';
    const escaped = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return Prism.highlight(escaped, Prism.languages['json'], 'json');
  });

  readonly markdown = computed<string>(() => {
    const text = this.mode() === 'edit' ? this.editorText() : this.baseJsonText();
    return this.toMarkdown(text);
  });

  onEditorInput(value: string) {
    this.editorText.set(value);
    this.parseError.set(null);

    // Without a toolbar there is no Apply button, so format, validate and emit directly.
    if (!this.showToolbar()) {
      this.autoApply();
    }
  }

  private autoApply() {
    const text = this.editorText();
    if (!text.trim()) {
      this.parseError.set(null);
      return;
    }

    const parsed = this.tryDeserialize(text);
    if (!parsed.ok) {
      this.parseError.set(parsed.error);
      return;
    }

    this.parseError.set(null);

    const normalized = this.safeSerialize(parsed.value);
    if (normalized !== text) {
      this.keepCaretPosition(text, normalized);
    }

    this.editorText.set(normalized);
    this.lastLoadedText.set(normalized);

    this.valueChange.emit(parsed.value);
  }


  private keepCaretPosition(previousText: string, normalized: string): void {
    const textarea = this.textarea()?.nativeElement;
    if (!textarea || textarea.ownerDocument.activeElement !== textarea) {
      return;
    }

    const caret = textarea.selectionStart ?? previousText.length;
    const significant = this.countSignificant(previousText.slice(0, caret));

    afterNextRender(() => {
      const position = this.positionAfterSignificant(normalized, significant);
      textarea.setSelectionRange(position, position);
    }, {injector: this.injector});
  }

  private countSignificant(text: string): number {
    let count = 0;
    for (const char of text) {
      if (!/\s/.test(char)) count++;
    }
    return count;
  }

  private positionAfterSignificant(text: string, significant: number): number {
    if (significant <= 0) {
      return 0;
    }

    let count = 0;
    for (let i = 0; i < text.length; i++) {
      if (!/\s/.test(text[i])) {
        count++;
        if (count === significant) return i + 1;
      }
    }
    return text.length;
  }

  format() {
    const text = this.editorText();
    if (!text.trim()) {
      this.parseError.set(null);
      this.editorText.set('');
      return;
    }

    const parsed = this.tryDeserialize(text);
    if (parsed.ok) {
      this.editorText.set(this.safeSerialize(parsed.value));
      this.parseError.set(null);
    } else {
      this.parseError.set(parsed.error);
    }
  }

  validate() {
    const text = this.editorText();
    if (!text.trim()) {
      this.parseError.set(null);
      return;
    }

    const parsed = this.tryDeserialize(text);
    this.parseError.set(parsed.ok ? null : parsed.error);
  }

  reset() {
    this.editorText.set(this.lastLoadedText());
    this.parseError.set(null);
  }

  apply() {
    const text = this.editorText();
    const parsed = this.tryDeserialize(text);

    if (!parsed.ok) {
      this.parseError.set(parsed.error);
      return;
    }

    this.parseError.set(null);

    const normalized = this.safeSerialize(parsed.value);
    this.lastLoadedText.set(normalized);
    this.editorText.set(normalized);

    this.valueChange.emit(parsed.value);
  }

  syncScroll(ev: Event) {
    const ta = ev.target as HTMLTextAreaElement;
    const pre = ta.previousElementSibling as HTMLElement; // .je-pre
    pre.scrollTop = ta.scrollTop;
    pre.scrollLeft = ta.scrollLeft;
  }

  private toMarkdown(jsonText: string): string {
    if (!jsonText.trim()) {
      return `_No data_`;
    }
    return jsonText;
  }

  private safeSerialize(value: T): string {
    try {
      return this.serialize()(value);
    } catch {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
  }

  private tryDeserialize(text: string): { ok: true; value: T } | { ok: false; error: string } {
    try {
      return {ok: true, value: this.deserialize()(text)};
    } catch (e: any) {
      return {ok: false, error: e?.message ?? 'Invalid JSON'};
    }
  }
}

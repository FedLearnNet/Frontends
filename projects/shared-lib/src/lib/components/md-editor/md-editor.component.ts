import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  forwardRef,
  AfterViewInit, OnChanges, SimpleChanges
} from '@angular/core';
import {MarkdownComponent, MarkdownService, provideMarkdown} from 'ngx-markdown';
import EasyMDE from 'easymde';
import {ControlValueAccessor, NG_VALUE_ACCESSOR} from '@angular/forms';
import {CommonModule} from "@angular/common";


@Component({
  selector: 'app-md-editor',
  templateUrl: './md-editor.component.html',
  styleUrls: ['./md-editor.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MarkdownComponent
  ],
  providers: [
    provideMarkdown(),
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MarkDownEditorComponent),
      multi: true
    }
  ]
})
export class MarkDownEditorComponent implements AfterViewInit, ControlValueAccessor, OnChanges {

  onChange: (value: any) => void = () => {
  };
  onTouched: () => void = () => {
  };
  isDisabled: boolean = false;


  @Input() defaultValue: string | undefined = '';
  //https://www.npmjs.com/package/easymde#toolbar-icons
  @Input() toolbar: string[] = [
    "bold",
    "italic",
    "strikethrough",
    "heading-1",
    "heading-2",
    "heading-3",
    "code",
    "quote",
    "unordered-list",
    "ordered-list",
    "clean-block",
    "link",
    "image",
    "table",
    "horizontal-rule"
  ];

  @Output() newMarkdownEvent = new EventEmitter<string>;

  @ViewChild('markdownInput') markdownEditor: ElementRef;

  public markdown: string = "";
  private editor: EasyMDE;
  constructor(private markdownService: MarkdownService) {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['defaultValue']) {
      this.markdown = changes['defaultValue'].currentValue;
      if(this.editor){
        this.editor.value(this.markdown);
      }
    }
  }

  ngAfterViewInit(): void {
    this.markdown = this.defaultValue ?? "";

    //https://www.npmjs.com/package/easymde#configuration
    this.editor = new EasyMDE({
      element: this.markdownEditor.nativeElement,
      toolbar: this.toolbar as any,
      placeholder: "Type here...",
      unorderedListStyle: '-',
      previewRender: (plainText, preview) => {
        const parsed = this.markdownService.parse(plainText);
        if (parsed instanceof Promise) {
          parsed.then(parsedText => {
            preview.innerHTML = parsedText;
            console.log(preview.innerHTML);
          });

          return "Loading...";
        } else {
          preview.innerHTML = parsed;
          console.log(preview.innerHTML);
        }
        return parsed;
      },
    });

    if (this.markdown) {
      this.editor.value(this.markdown);
    }

    this.editor.codemirror.on("change", () => {
      this.markdown = this.editor.value();
      this.newMarkdownEvent.emit(this.markdown);
      this.onChange(this.markdown);
    });

  }

  writeValue(obj: any): void {
    this.markdown = obj;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }


}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import {ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {SLUG_REGEX} from "../../helper/validator";
import {HintCardComponent} from "@shared-lib/components/hint-card/hint-card.component";


@Component({
  selector: 'app-tool-slug-input',
  imports: [MatFormFieldModule, MatInputModule, MatIconModule, MatButtonModule, FormsModule, HintCardComponent],
  templateUrl: './tool-slug-input.component.html',
  styleUrl: './tool-slug-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToolSlugInputComponent),
      multi: true,
    },
  ],
})
export class ToolSlugInputComponent implements ControlValueAccessor {
  value = model<string>('');
  toolName = input<string>('');

  appearance= input< "fill" | "outline">('outline');
  label = input<string>('Slug');
  placeholder = input<string>('e.g. my-tool-1');
  hint = input<string>('Used in URLs and identifiers. Lowercase letters/digits, hyphen-separated.');
  required = input<boolean>(true);
  disabled = input<boolean>(false);


  showErrors = input<boolean>(false);

  externalError = input<string | null>(null);

  valueChange = output<string>();


  readonly innerValue = signal<string>('');
  private readonly innerDisabled = signal<boolean>(false);

  private readonly userEdited = signal<boolean>(false);

  readonly isDisabled = computed(() => this.innerDisabled() || this.disabled());
  readonly normalizedValue = computed(() => (this.innerValue() ?? '').trim());
  readonly isEmpty = computed(() => this.normalizedValue().length === 0);

  readonly patternValid = computed(() => {
    const v = this.normalizedValue();
    if (!v) return !this.required();
    return SLUG_REGEX.test(v);
  });

  readonly requiredValid = computed(() => !this.required() || !this.isEmpty());

  readonly effectiveValid = computed(() => this.requiredValid() && this.patternValid());

  readonly aiStoreUrl = `${location.origin}/store/`;


  private onChange: (v: string) => void = () => {
  };
  protected onTouched: () => void = () => {
  };

  constructor() {
    effect(() => {
      const v = this.value();
      this.innerValue.set(v ?? '');
    });

    effect(() => {
      const src = this.toolName() ?? '';
      if (!src) return;
      if (this.userEdited()) return;

      const next = toSlug(src);
      if (!next) return;

      this.setInternal(next, /*emit*/ true, /*markUserEdited*/ false);
    });
  }

  writeValue(v: string | null): void {
    this.innerValue.set(v ?? '');
  }

  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.innerDisabled.set(isDisabled);
  }

  onInput(event: Event) {
    const raw = (event.target as HTMLInputElement).value;
    if (this.isDisabled()) return;

    this.userEdited.set(true);
    this.setInternal(raw, /*emit*/ true, /*markUserEdited*/ true);
  }

  private setInternal(v: string, emit: boolean, markUserEdited: boolean) {
    this.innerValue.set(v ?? '');
    if (markUserEdited) this.userEdited.set(true);

    if (emit) {
      const out = this.innerValue();
      this.onTouched();
      this.onChange(out);
      this.value.set(out);
    }
  }
}

function toSlug(input: string): string {
  return (input ?? '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // drop invalid chars
    .replace(/\s+/g, '-')        // spaces -> hyphen
    .replace(/-+/g, '-')         // collapse hyphens
    .replace(/^-+|-+$/g, '');    // trim hyphens
}

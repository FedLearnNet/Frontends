import {ChangeDetectionStrategy, Component, computed, input, output, signal, viewChild} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {
  MatAutocomplete,
  MatAutocompleteSelectedEvent,
  MatAutocompleteTrigger,
  MatOption
} from "@angular/material/autocomplete";
import {MatIconButton} from "@angular/material/button";
import {MatInput} from "@angular/material/input";
import {MatProgressBar} from "@angular/material/progress-bar";
import {MatIcon} from "@angular/material/icon";
import {MatFormFieldModule} from "@angular/material/form-field";

@Component({
  selector: 'lib-chat-input',
  imports: [
    FormsModule,
    MatAutocomplete,
    MatAutocompleteTrigger,
    MatFormFieldModule,
    MatIcon,
    MatIconButton,
    MatInput,
    MatOption,
    MatProgressBar,
  ],
  templateUrl: './chat-input.component.html',
  styleUrl: './chat-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatInputComponent {
  connected = input.required<boolean>();
  allSuggestion = input<string[]>([]);
  positionAbsolute = input<boolean>(true);

  content = output<string>();
  autoTrigger = viewChild(MatAutocompleteTrigger);

  loading = signal<boolean>(false);
  message = signal<string>('');

  messageLength = computed(() => this.message().length);

  readonly suggestions = computed(() => {
    const maxSuggestions = 5;
    const q = this.message().trim().toLowerCase();
    if (!q) return this.allSuggestion().slice(0, maxSuggestions);
    return this.allSuggestion()
      .filter(s => s.toLowerCase().includes(q))
      .slice(0, maxSuggestions);
  });

  public submit() {
    const content = (this.message() || '').trim();
    if (!content) return;
    this.content.emit(content);
    this.message.set("");
    if (this.autoTrigger()) {
      this.autoTrigger()!.closePanel();
    }
  }

  public onOptionSelected(e: MatAutocompleteSelectedEvent) {
    const v = (e.option.value || '').trim();
    if (!v) return;
    this.message.set(v);
  }


  public onEnter(event: Event) {
    event.preventDefault();
    this.submit();
  }
}

import { Component, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '@shared-lib/services/translation.service';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'app-connector',
    templateUrl: './connector.component.html',
    styleUrl: './connector.component.scss',
    imports: [RouterOutlet]
})
export class ConnectorComponent {
  private translate = inject(TranslateService);
  private translationService = inject(TranslationService);

  constructor() {
    this.translate.use(this.translationService.getCurrentLanguage());
  }
}

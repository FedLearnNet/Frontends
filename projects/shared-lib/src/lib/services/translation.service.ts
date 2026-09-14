import {inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private translate: TranslateService = inject(TranslateService);

  constructor() {
    const savedLang = localStorage.getItem('language') || 'en';
    this.translate.use(savedLang);
  }


  initLanguage(): void {
    const savedLang = localStorage.getItem('language') || 'en';

    this.translate.setFallbackLang(savedLang);
    this.translate.use(savedLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    localStorage.setItem('language', lang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}

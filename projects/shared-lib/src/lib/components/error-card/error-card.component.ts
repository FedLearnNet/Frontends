import {Component, computed, input, output} from '@angular/core';
import {AutoplayOnViewDirective} from "@shared-lib/directives/autoplay-on-view.directive";
import {MatButton} from "@angular/material/button";
import {ErrorResponseDTO} from "@shared-lib/base/error";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'lib-error-card',
  imports: [
    MatButton,
    AutoplayOnViewDirective
  ],
  templateUrl: './error-card.component.html',
  styleUrl: './error-card.component.scss'
})
export class ErrorCardComponent {

  errorObject = input<string | object | null | undefined>();

  warningButtonText = input<string>();
  oopsError = input<string>();
  showOops = input<boolean>(false);

  errorText = computed(() => {
    const oopsError = this.oopsError();
    if (oopsError) {
      try {
        return JSON.stringify(oopsError);
      } catch {
        return oopsError;
      }
    }
    return oopsError;
  });

  showAnimation = input<boolean>(false);
  warningClicked = output<boolean>();

  onWarningClick(): void {
    if (!this.warningButtonText()) {
      return;
    }
    this.warningClicked.emit(true);
  }

  readonly errorObjectParsed = computed(() => {
    const errorObject = this.errorObject();
    if (!errorObject) {
      return "";
    }
    const isString = typeof errorObject === 'string' || errorObject instanceof String
    const parsed = isString ? this.tryParseJson(errorObject as string) : errorObject;
    if (this.isHttpErrorResponseLike(parsed)) {
      return this.getMessageFromHttpLike(parsed as HttpErrorResponse);
    }

    if (this.isErrorResponseDTO(parsed)) {
      return parsed.message;
    }

    if (parsed !== undefined) {
      const msg = this.pickMessageField(parsed);
      return msg ?? this.compactJson(parsed);
    }
    return errorObject;
  });

  private tryParseJson(raw: string): unknown | undefined {
    const startsLikeJson =
      (raw.startsWith('{') && raw.endsWith('}')) ||
      (raw.startsWith('[') && raw.endsWith(']')) ||
      (raw.startsWith('"') && raw.endsWith('"')) ||
      raw === 'null' ||
      raw === 'true' ||
      raw === 'false' ||
      /^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(raw);

    if (!startsLikeJson) return undefined;

    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  }

  private isHttpErrorResponseLike(val: any) {
    if (!val || typeof val !== 'object') return false;
    const v = val as any;
    return ('status' in v) || ('statusText' in v) || ('error' in v) || ('message' in v);
  }

  private getMessageFromHttpLike(err: HttpErrorResponse): string {
    const msgParsed =
      this.tryParseJson(err.message.trim());

    if (this.isErrorResponseDTO(msgParsed)) {
      return msgParsed.message as string;
    }

    if (this.isErrorResponseDTO(err.error)) {
      return err.error.message as string;
    }

    if (typeof err.error === 'string') {
      const errParsed = this.tryParseJson(err.error.trim());
      if (this.isErrorResponseDTO(errParsed)) {
        return errParsed.message as string;
      }
      if (errParsed !== undefined) {
        const msg = this.pickMessageField(errParsed);
        return msg ?? this.compactJson(errParsed);
      }
    }

    return err.message?.trim() || err.statusText?.trim() || 'Request failed';
  }

  private isErrorResponseDTO(val: unknown): val is ErrorResponseDTO {
    if (!val || typeof val !== 'object') return false;
    const v = val as any;
    return typeof v.status === 'number'
      && typeof v.error === 'string'
      && typeof v.message === 'string';
  }

  private pickMessageField(val: unknown): string | null {
    if (!val) return null;
    if (typeof val === 'string') return val;
    if (typeof val !== 'object') return String(val);

    const v = val as any;
    if (typeof v.message === 'string') return v.message;
    if (typeof v.error_description === 'string') return v.error_description; // oauth-ish
    if (typeof v.error === 'string') return v.error;

    return null;
  }

  private compactJson(val: unknown): string {
    try {
      const s = JSON.stringify(val);
      return s.length > 2000 ? s.slice(0, 2000) + '…' : s;
    } catch {
      return String(val);
    }
  }

}

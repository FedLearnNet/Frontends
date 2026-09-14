import {Component, computed, inject, input} from '@angular/core';
import {DomSanitizer} from "@angular/platform-browser";
import {FileContentDTO} from "@shared-lib/modules/files/dto/file";
import {ToolConfigDataType} from "@shared-lib/modules/app-execution/dto/config";
import {CsvFileViewerComponent} from "@shared-lib/components/csv-file-viewer/csv-file-viewer.component";

@Component({
  selector: 'lib-file-content',
  imports: [
    CsvFileViewerComponent
  ],
  templateUrl: './file-content.component.html',
  styleUrl: './file-content.component.scss',
})
export class FileContentComponent {
  private readonly sanitizer = inject(DomSanitizer);

  fileContent = input.required<FileContentDTO>();
  name = input.required<string>();
  base64Encoded = computed(() => {
    const value = this.fileContent().content;
    if (!value) return false;
    const s = value.trim();
    if (/^data:[^;]+;base64,/i.test(s)) return true;
    if (s.length < 16) return false;
    if (s.length % 4 !== 0) return false;
    if (!/^[A-Za-z0-9+/]+={0,2}$/.test(s)) return false;
    return true;
  })

  isHTML = computed(() => {
    const fileContent = this.fileContent();
    const content = this.content();
    if (fileContent && content) {
      if (fileContent.type === ToolConfigDataType.HTML) {
        return true;
      }
      const s = content.trim();
      if (!s) return false;
      const doc = new DOMParser().parseFromString(s, "text/html");
      return doc.body.children.length > 0;
    }
    return false;
  });
  content = computed(() => {
    const value = this.fileContent().content;
    if (!value) return value;

    if (!this.base64Encoded()) return value;

    return value.replace(/^data:[^;]+;base64,/i, '').trim();
  });
  safeIframeUrl = computed(() => {
    const fileContent = this.fileContent();
    const content = this.content();
    if (fileContent && content) {
      if (this.isHTML()) {
        const html = this.base64Encoded()
          ? window.atob(content.trim())
          : content;

        return this.sanitizer.bypassSecurityTrustResourceUrl('data:text/html;charset=utf-8,' + encodeURIComponent(html));
      }
    }
    return undefined;
  });

  fitIframeOnce(iframe: HTMLIFrameElement) {
    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) return;

    requestAnimationFrame(() => {
      const h = Math.max(
        doc.body?.scrollHeight ?? 0,
        doc.documentElement?.scrollHeight ?? 0
      );
      iframe.style.height = `${h}px`;
    });
  }

  protected readonly FederatedAppConfigDataType = ToolConfigDataType;


}

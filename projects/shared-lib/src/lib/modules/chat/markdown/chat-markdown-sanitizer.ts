import {inject, Provider, SecurityContext} from "@angular/core";
import {DomSanitizer} from "@angular/platform-browser";
import {provideMarkdown, SANITIZE} from "ngx-markdown";

// Chat content is LLM output steerable by store texts and abstracts, so it is always sanitized.
// Angular's sanitizer drops data-* attributes, so validated action links travel through it as href.

const ACTION_CLASS = 'app-action';
const KINDS = new Set(['APP', 'MODEL', 'FILE']);
const ACTIONS = new Set(['DETAIL', 'ADD_TO_WORKFLOW']);
const ID = /^\d{1,18}$/;
const CARRIER = /^#app-action:([A-Z]+):([A-Z_]+):(\d{1,18})$/;

interface ChatAction {
  kind: string;
  action: string;
  id: string;
}

function validAction(anchor: Element): ChatAction | null {
  const kind = (anchor.getAttribute('data-kind') ?? '').trim().toUpperCase();
  const action = (anchor.getAttribute('data-action') ?? '').trim().toUpperCase().replaceAll('-', '_');
  const id = (anchor.getAttribute('data-id') ?? '').trim();
  return KINDS.has(kind) && ACTIONS.has(action) && ID.test(id) ? {kind, action, id} : null;
}

function parse(html: string): Document {
  // DOMParser documents are inert: no scripts run, nothing loads
  return new DOMParser().parseFromString(html, 'text/html');
}

export function sanitizeChatHtml(html: string, sanitizer: DomSanitizer): string {
  const source = parse(html);
  source.querySelectorAll('a').forEach(anchor => {
    const action = anchor.classList.contains(ACTION_CLASS) ? validAction(anchor) : null;
    if (action) {
      for (const name of anchor.getAttributeNames()) {
        anchor.removeAttribute(name);
      }
      anchor.setAttribute('class', ACTION_CLASS);
      anchor.setAttribute('href', `#app-action:${action.kind}:${action.action}:${action.id}`);
    } else {
      anchor.classList.remove(ACTION_CLASS);
    }
  });

  const sanitized = sanitizer.sanitize(SecurityContext.HTML, source.body.innerHTML) ?? '';

  const result = parse(sanitized);
  result.querySelectorAll('a').forEach(anchor => {
    const match = CARRIER.exec(anchor.getAttribute('href') ?? '');
    if (!anchor.classList.contains(ACTION_CLASS) || !match || !KINDS.has(match[1]) || !ACTIONS.has(match[2])) {
      anchor.classList.remove(ACTION_CLASS);
      return;
    }
    anchor.removeAttribute('href');
    anchor.setAttribute('data-kind', match[1]);
    anchor.setAttribute('data-action', match[2]);
    anchor.setAttribute('data-id', match[3]);
  });
  // Angular prefixes blocked urls with "unsafe:"
  result.querySelectorAll('[href^="unsafe:"], [src^="unsafe:"]').forEach(element => {
    element.removeAttribute('href');
    element.removeAttribute('src');
  });
  // Links of the model open outside the platform tab
  result.querySelectorAll('a[href]').forEach(anchor => {
    anchor.setAttribute('target', '_blank');
    anchor.setAttribute('rel', 'noopener noreferrer');
  });
  return result.body.innerHTML;
}

export function provideChatMarkdown(): Provider[] {
  return provideMarkdown({
    sanitize: {
      provide: SANITIZE,
      useFactory: () => {
        const sanitizer = inject(DomSanitizer);
        return (html: string) => sanitizeChatHtml(html, sanitizer);
      },
    },
  });
}

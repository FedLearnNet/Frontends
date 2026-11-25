import {TestBed} from "@angular/core/testing";
import {DomSanitizer} from "@angular/platform-browser";
import {sanitizeChatHtml} from "./chat-markdown-sanitizer";

describe('sanitizeChatHtml', () => {
  let sanitizer: DomSanitizer;

  beforeEach(() => {
    sanitizer = TestBed.inject(DomSanitizer);
  });

  function render(html: string): HTMLElement {
    const host = document.createElement('div');
    host.innerHTML = sanitizeChatHtml(html, sanitizer);
    return host;
  }

  it('keeps valid action links', () => {
    const host = render('<p>Use <a class="app-action" data-kind="APP" data-action="ADD_TO_WORKFLOW" data-id="12">GMM</a></p>');
    const anchor = host.querySelector('a.app-action') as HTMLAnchorElement;
    expect(anchor).not.toBeNull();
    expect(anchor.dataset['kind']).toBe('APP');
    expect(anchor.dataset['action']).toBe('ADD_TO_WORKFLOW');
    expect(anchor.dataset['id']).toBe('12');
    expect(anchor.hasAttribute('href')).toBeFalse();
    expect(anchor.textContent).toBe('GMM');
  });

  it('normalises kind and action case', () => {
    const anchor = render('<a class="app-action" data-kind="model" data-action="detail" data-id="3">M</a>')
      .querySelector('a.app-action') as HTMLAnchorElement;
    expect(anchor.dataset['kind']).toBe('MODEL');
    expect(anchor.dataset['action']).toBe('DETAIL');
  });

  it('drops action links with unknown values', () => {
    const host = render('<a class="app-action" data-kind="APP" data-action="DELETE" data-id="1">x</a>'
      + '<a class="app-action" data-kind="APP" data-action="DETAIL" data-id="1 onmouseover=alert(1)">y</a>');
    expect(host.querySelectorAll('a.app-action').length).toBe(0);
  });

  it('removes scripts, handlers and javascript urls', () => {
    const host = render('<img src="x" onerror="alert(1)"><script>alert(2)</script>'
      + '<a href="javascript:alert(3)">z</a><a class="app-action" data-kind="APP" data-action="DETAIL" data-id="1" onclick="alert(4)">a</a>');
    expect(host.querySelector('script')).toBeNull();
    expect(host.innerHTML).not.toContain('onerror');
    expect(host.innerHTML).not.toContain('onclick');
    expect(host.innerHTML).not.toContain('javascript:alert');
  });

  it('does not let forged carrier hrefs through', () => {
    const host = render('<a href="#app-action:APP:DETAIL:5">plain</a>');
    expect(host.querySelectorAll('a.app-action').length).toBe(0);
  });

  it('opens model links in a new tab', () => {
    const anchor = render('<a href="https://example.org">ref</a>').querySelector('a') as HTMLAnchorElement;
    expect(anchor.target).toBe('_blank');
    expect(anchor.rel).toBe('noopener noreferrer');
  });
});

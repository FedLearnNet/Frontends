import {ComponentFixture, TestBed} from '@angular/core/testing';
import {Clipboard} from '@angular/cdk/clipboard';
import {TranslateModule} from '@ngx-translate/core';

import {QueryJsonPreviewComponent} from './query-json-preview.component';

describe('QueryJsonPreviewComponent', () => {
  let fixture: ComponentFixture<QueryJsonPreviewComponent>;
  let clipboard: jasmine.SpyObj<Clipboard>;
  const body = {name: 'Adults', description: 'Age above 18', query: {connecting_operator: '$and', conditions: []}};

  beforeEach(() => {
    clipboard = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);
    clipboard.copy.and.returnValue(true);
    TestBed.configureTestingModule({
      imports: [QueryJsonPreviewComponent, TranslateModule.forRoot()],
      providers: [{provide: Clipboard, useValue: clipboard}],
    });
    fixture = TestBed.createComponent(QueryJsonPreviewComponent);
    fixture.componentRef.setInput('body', body);
    fixture.detectChanges();
  });

  it('renders the request body as formatted JSON', () => {
    const code = fixture.nativeElement.querySelector('pre') as HTMLElement;
    expect(code.textContent).toBe(JSON.stringify(body, null, 2));
  });

  it('copies the JSON to the clipboard', () => {
    (fixture.nativeElement.querySelector('button') as HTMLButtonElement).click();
    expect(clipboard.copy).toHaveBeenCalledWith(JSON.stringify(body, null, 2));
    expect(fixture.componentInstance.copied()).toBeTrue();
  });
});

import {environment} from "@shared-lib/env/environment";

const normalizeBaseHref = (): string => {
  const baseHref = environment.keycloak.baseHref?.trim() || '/';

  if (baseHref === '/') {
    return baseHref;
  }

  return `/${baseHref.replace(/^\/+|\/+$/g, '')}/`;
};

/** Absolute URL of a path inside this app, respecting the base href. */
export const getAppUrl = (suffix: string = ''): string => {
  const baseHref = normalizeBaseHref();
  const normalizedSuffix = suffix.trim();

  if (!normalizedSuffix) {
    return `${window.location.origin}${baseHref}`;
  }

  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(normalizedSuffix)) {
    return normalizedSuffix;
  }

  const suffixWithLeadingSlash = normalizedSuffix.startsWith('/')
    ? normalizedSuffix
    : `/${normalizedSuffix}`;
  const baseHrefWithoutTrailingSlash = baseHref.endsWith('/')
    ? baseHref.slice(0, -1)
    : baseHref;
  const suffixAlreadyContainsBaseHref = baseHref === '/'
    || suffixWithLeadingSlash === baseHrefWithoutTrailingSlash
    || suffixWithLeadingSlash.startsWith(baseHref);

  if (suffixAlreadyContainsBaseHref) {
    return `${window.location.origin}${suffixWithLeadingSlash}`;
  }

  return `${window.location.origin}${baseHref}${normalizedSuffix.replace(/^\/+/, '')}`;
};

/** Path, query and fragment of the current page, e.g. "/cohort/5?tab=2". */
export const getCurrentPath = (): string =>
  `${window.location.pathname}${window.location.search}${window.location.hash}`;

/** Turns a router URL ("/cohort/5") into the browser path, including the base href. */
export const toAbsolutePath = (routerUrl: string): string => {
  const url = new URL(routerUrl.replace(/^\/+/, ''), document.baseURI);
  return `${url.pathname}${url.search}${url.hash}`;
};

/** Resolves a relative or absolute URL against the app and returns it as absolute URL. */
export const resolveUrl = (url: string): string => new URL(url, document.baseURI).toString();

export const isSameOrigin = (url: string): boolean =>
  new URL(url, document.baseURI).origin === window.location.origin;

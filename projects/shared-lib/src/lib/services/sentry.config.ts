import * as Sentry from '@sentry/angular';

export function initSentry(): void {
  Sentry.init({
    environment: 'produktion',
    dsn: 'IHRE_GITLAB_DSN_HIER',
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

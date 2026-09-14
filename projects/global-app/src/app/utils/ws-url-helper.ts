import {environment} from '@global-app/env/environment';


export function getWsUrl(url: string, protocol?: string) {
  const normalizedUrl = (url ?? '').trim();
  const normalizedProtocol = protocol?.trim().replace(/:\/\/$/, '').toLowerCase();

  let targetProtocol: 'ws' | 'wss' = 'ws';

  if (normalizedProtocol === 'wss' || normalizedProtocol === 'https') {
    targetProtocol = 'wss';
  } else if (normalizedProtocol === 'ws' || normalizedProtocol === 'http') {
    targetProtocol = 'ws';
  } else if (normalizedUrl.startsWith('https://')) {
    targetProtocol = 'wss';
  }

  if (!normalizedUrl) {
    return `${targetProtocol}://`;
  }

  if (normalizedUrl.startsWith('wss://') || normalizedUrl.startsWith('ws://')) {
    return normalizedUrl.replace(/^wss?:\/\//, `${targetProtocol}://`);
  }

  if (normalizedUrl.startsWith('https://') || normalizedUrl.startsWith('http://')) {
    return normalizedUrl.replace(/^https?:\/\//, `${targetProtocol}://`);
  }

  if (normalizedUrl.startsWith('//')) {
    return `${targetProtocol}:${normalizedUrl}`;
  }

  if (normalizedUrl.startsWith('/')) {
    return `${targetProtocol}://${normalizedUrl}`;
  }

  return `${targetProtocol}://${normalizedUrl}`;
}

export function getConfigWSUrl() {
  const configuredLearningApiUrl = environment.globalLearningApiUrl?.trim();
  const learningApiUrl = configuredLearningApiUrl
    ? buildUrlFromOrigin(configuredLearningApiUrl)
    : window.location.origin;

  const result = getWsUrl(learningApiUrl, environment.globalLearningApiWSProtocol);
  console.log(`Parse websocket URL based on: ${learningApiUrl}, Result: ${result}`);
  return result;
}

function buildUrlFromOrigin(url: string) {
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('ws://') || url.startsWith('wss://')) {
    return url;
  }

  if (url.startsWith('//')) {
    return `${window.location.protocol}${url}`;
  }

  if (url.startsWith('/')) {
    return `${window.location.origin}${url}`;
  }

  return `${window.location.origin}/${url}`;
}

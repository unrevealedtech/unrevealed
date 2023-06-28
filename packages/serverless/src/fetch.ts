import nodeFetch from 'node-fetch';

export function getFetch() {
  if (globalThis.fetch) {
    return globalThis.fetch;
  }

  return nodeFetch;
}

const apiBase = import.meta.env.VITE_API_BASE ?? '/api';

/** Resolve an image saved by the backend when the frontend and API use different domains. */
export function assetUrl(url: string) {
  if (!url.startsWith('/generated/')) return url;
  if (!apiBase.startsWith('http')) return url;
  return `${apiBase.replace(/\/api\/?$/, '')}${url}`;
}

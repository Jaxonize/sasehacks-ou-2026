import { TASKS_READONLY } from './tasks.ts';

interface TokenResponse { access_token?: string; expires_in?: number | string; scope?: string; error?: string }
export interface GoogleIdentity {
  initTokenClient(config: { client_id: string; scope: string; include_granted_scopes: boolean; callback: (response: TokenResponse) => void; error_callback: (error: { type: string }) => void }): { requestAccessToken: (options: { prompt: string }) => void };
}
function identity(): GoogleIdentity | undefined {
  return (window as unknown as { google?: { accounts?: { oauth2?: GoogleIdentity } } }).google?.accounts?.oauth2;
}

export function connectionUnavailable(clientId: string | undefined, origin: string): string | null {
  if (!clientId?.trim()) return 'Google Tasks is not configured for this demo yet. Your local reminders still work.';
  const url = new URL(origin);
  const loopback = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  const rawIp = /^\d+\.\d+\.\d+\.\d+$/.test(url.hostname) || url.hostname.includes(':');
  if ((!loopback && (url.protocol !== 'https:' || rawIp)) || !['https:', 'http:'].includes(url.protocol)) return 'Google sign-in is unavailable at this Wi-Fi preview address. Use the configured localhost or HTTPS version.';
  return null;
}

let loading: Promise<GoogleIdentity> | undefined;
export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  const ready = identity();
  if (ready) return Promise.resolve(ready);
  if (loading) return loading;
  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client'; script.async = true;
    const timeout = setTimeout(() => fail(), 15000);
    function fail() { clearTimeout(timeout); script.remove(); loading = undefined; reject(new Error('Google sign-in could not load. Check your connection and reopen this panel.')); }
    script.onload = () => { clearTimeout(timeout); const api = identity(); if (api) resolve(api); else fail(); };
    script.onerror = fail;
    document.head.append(script);
  });
  return loading;
}

export function hasTasksScope(scope: string | undefined): boolean {
  return !!scope?.split(/\s+/).includes(TASKS_READONLY);
}

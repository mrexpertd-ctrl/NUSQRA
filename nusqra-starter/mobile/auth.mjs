import { Capacitor } from '@capacitor/core';

export const isNativeApp = Capacitor.isNativePlatform();
export const mobileCallback = 'com.nusqra.marketplace://auth/callback';

export async function startGoogleSignIn(client, webRedirect) {
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: isNativeApp ? mobileCallback : webRedirect,
      skipBrowserRedirect: isNativeApp,
    },
  });
  if (error) throw error;
  if (isNativeApp) {
    if (!data.url) throw new Error('Google sign-in did not return a login URL.');
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url });
  }
}

export function watchMobileAuth(client, onError) {
  if (!isNativeApp) return;
  let active = true;
  let listener;
  let lastCode;

  async function handleCallback(rawUrl) {
    if (!active || !rawUrl) return;
    let url;
    try { url = new URL(rawUrl); } catch { return; }
    if (url.protocol !== 'com.nusqra.marketplace:' || url.host !== 'auth' || url.pathname !== '/callback') return;
    const code = url.searchParams.get('code');
    if (code && lastCode === code) return;
    lastCode = code;
    try {
      const { Browser } = await import('@capacitor/browser');
      await Browser.close();
    } catch {
      // Android's browser tab normally closes when the app receives the link.
    }
    if (!code) {
      if (active) onError();
      return;
    }
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (active && error) onError();
  }

  void (async () => {
    try {
      const { App } = await import('@capacitor/app');
      if (!active) return;
      listener = await App.addListener('appUrlOpen', ({ url }) => {
        void handleCallback(url).catch(() => { if (active) onError(); });
      });
      if (!active) {
        await listener.remove();
        return;
      }
      await handleCallback((await App.getLaunchUrl())?.url);
    } catch {
      if (active) onError();
    }
  })();

  return () => {
    active = false;
    void listener?.remove();
  };
}

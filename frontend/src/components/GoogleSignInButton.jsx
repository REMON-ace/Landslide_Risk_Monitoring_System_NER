import { useEffect, useRef, useState } from 'react';

const GOOGLE_GIS_SCRIPT = 'https://accounts.google.com/gsi/client';

/** Renders Google Identity Services without putting any secret in the browser. */
export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState('');
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId || !containerRef.current) return undefined;

    const render = () => {
      if (!window.google?.accounts?.id || !containerRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => callbackRef.current(credential),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      containerRef.current.replaceChildren();
      window.google.accounts.id.renderButton(containerRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        width: 360,
      });
    };

    const existing = document.querySelector(`script[src="${GOOGLE_GIS_SCRIPT}"]`);
    if (existing) {
      if (window.google?.accounts?.id) render();
      else existing.addEventListener('load', render, { once: true });
      return () => existing.removeEventListener('load', render);
    }

    const script = document.createElement('script');
    script.src = GOOGLE_GIS_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = render;
    script.onerror = () => setLoadError('Google sign-in could not be loaded.');
    document.head.appendChild(script);
    return () => script.remove();
  }, [clientId]);

  if (!clientId) {
    return <p className="text-center text-xs text-slate-500">Google sign-in is not configured.</p>;
  }
  if (loadError) return <p className="text-center text-xs text-red-600">{loadError}</p>;

  return (
    <div className={disabled ? 'pointer-events-none opacity-50' : ''}>
      <div ref={containerRef} className="flex justify-center" />
    </div>
  );
}

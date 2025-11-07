'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type Check = {
  ok: boolean;
  status?: number;
  location?: string | null;
  supabase_url: string;
  message?: string;
  error?: string;
};

export default function AuthDebugPage() {
  const [env, setEnv] = useState<{ url: string | null; anonKey: string | null } | null>(null);
  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(false);
  const [clientUrl, setClientUrl] = useState<string | null>(null);

  useEffect(() => {
    // Runtime environment variables (client-side)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? null;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
    setEnv({ url, anonKey: key ? `${key.substring(0, 20)}...` : null });
    
    // Get actual Supabase client URL (from supabase client internals)
    try {
      // @ts-ignore - accessing internal property for debugging
      const supabaseUrl = supabase.supabaseUrl || null;
      setClientUrl(supabaseUrl);
    } catch (e) {
      console.error('Could not get Supabase client URL:', e);
    }
  }, []);

  const runCheck = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/provider-check');
      const j = await res.json();
      setCheck(j);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex items-center justify-center p-6">
      <div className="mx-auto max-w-xl w-full space-y-4">
        <h1 className="text-xl font-semibold">Auth Diagnostics</h1>
        <div className="glass rounded-xl border border-white/10 p-4 text-sm space-y-3">
          <div>
            <div className="font-semibold mb-2">Environment Variables:</div>
            <div className="space-y-1 text-xs">
              <div>
                <code className="bg-white/5 px-1 rounded">NEXT_PUBLIC_SUPABASE_URL</code>:{' '}
                <b className={env?.url?.includes('wuadppqrfliazlqvpclq') ? 'text-red-400' : 'text-green-400'}>
                  {env?.url ?? 'N/A'}
                </b>
                {env?.url?.includes('wuadppqrfliazlqvpclq') && (
                  <span className="ml-2 text-red-400 text-xs">⚠️ ESKİ PROJE!</span>
                )}
                {env?.url?.includes('xhbppxakbswgnriklwlm') && (
                  <span className="ml-2 text-green-400 text-xs">✓ DOĞRU PROJE</span>
                )}
              </div>
              <div>
                <code className="bg-white/5 px-1 rounded">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>:{' '}
                <b>{env?.anonKey ?? 'N/A'}</b>
              </div>
              {clientUrl && (
                <div>
                  Supabase Client URL:{' '}
                  <b className={clientUrl.includes('wuadppqrfliazlqvpclq') ? 'text-red-400' : 'text-green-400'}>
                    {clientUrl}
                  </b>
                </div>
              )}
            </div>
          </div>
          <div className="pt-2 border-t border-white/10">
            <div className="text-xs text-red-400 mb-2">
              ⚠️ Eğer eski proje URL&apos;si görüyorsanız, `.env.local` dosyasını güncelleyin:
            </div>
            <pre className="text-xs bg-black/20 p-2 rounded overflow-auto">
{`NEXT_PUBLIC_SUPABASE_URL=https://xhbppxakbswgnriklwlm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000`}
            </pre>
            <div className="text-xs text-white/60 mt-2">
              Dosyayı güncelledikten sonra dev server&apos;ı yeniden başlatın (Ctrl+C, sonra npm run dev)
            </div>
          </div>
          <button
            onClick={runCheck}
            className="mt-3 rounded-md border border-white/10 px-3 py-2 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Checking…' : 'Provider Check (Google)'}
          </button>
          {check && (
            <pre className="mt-3 whitespace-pre-wrap text-xs opacity-90 bg-black/20 p-3 rounded overflow-auto">
              {JSON.stringify(check, null, 2)}
            </pre>
          )}
        </div>
        <div className="glass rounded-xl border border-white/10 p-4 text-xs space-y-2">
          <p className="font-semibold">Beklenen Sonuç:</p>
          <p className="opacity-80">
            <code className="bg-white/5 px-1 rounded">ok: true</code> ve{' '}
            <code className="bg-white/5 px-1 rounded">location</code> içinde{' '}
            <code className="bg-white/5 px-1 rounded">accounts.google.com</code> görünmeli.
          </p>
          <p className="font-semibold mt-3">Eğer ok: false görüyorsanız:</p>
          <ol className="list-decimal list-inside space-y-1 opacity-80 ml-2">
            <li>Supabase Dashboard → Authentication → Providers → Google</li>
            <li>&quot;Enable&quot; butonuna tıklayın</li>
            <li>Google OAuth Client ID ve Secret&apos;ı ekleyin</li>
            <li>Kaydedin</li>
            <li>Google Cloud Console&apos;da Authorized redirect URI&apos;yi kontrol edin:
              <code className="block bg-white/5 px-1 rounded mt-1">
                https://xhbppxakbswgnriklwlm.supabase.co/auth/v1/callback
              </code>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}


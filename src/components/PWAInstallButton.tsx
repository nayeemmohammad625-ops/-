import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';
import { Language } from '../types/game';

interface Props {
  lang: Language;
}

export const PWAInstallButton: React.FC<Props> = ({ lang }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  const isBn = lang === 'bn';

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs md:text-sm shadow-md transition-all active:scale-95 border border-emerald-400/30"
        title={isBn ? 'অ্যাপ হিসেবে ইন্সটল করুন' : 'Install App'}
      >
        <Download className="w-4 h-4 text-emerald-200" />
        <span>{isBn ? 'অ্যাপ ইন্সটল করুন' : 'Install App'}</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs md:text-sm border border-slate-700 shadow-md transition active:scale-95"
        >
          <Smartphone className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'iOS এ ইন্সটল' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-700 p-6 shadow-2xl text-slate-100 relative animate-in fade-in zoom-in-95 duration-150">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">
                    {isBn ? 'iPhone / iPad এ ইন্সটল করুন' : 'Install on iPhone / iPad'}
                  </h3>
                  <p className="text-xs text-slate-400">PWA Web App</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-300 bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <p>
                  {isBn ? (
                    <>
                      ১. সাফারির নিচে থাকা <strong>Share (শেয়ার)</strong> আইকনে চাপ দিন।
                    </>
                  ) : (
                    <>
                      1. Tap the <strong>Share</strong> icon at the bottom of Safari.
                    </>
                  )}
                </p>
                <p>
                  {isBn ? (
                    <>
                      ২. নিচে স্ক্রোল করে <strong>Add to Home Screen (হোম স্ক্রিনে যোগ করুন)</strong> নির্বাচন করুন।
                    </>
                  ) : (
                    <>
                      2. Scroll down and tap <strong>Add to Home Screen</strong>.
                    </>
                  )}
                </p>
                <p>
                  {isBn ? (
                    <>
                      ৩. এবার হোম স্ক্রিন থেকে সম্পূর্ণ অফলাইনে অ্যাপের মতো সরাসরি খেলুন!
                    </>
                  ) : (
                    <>
                      3. Launch directly from your home screen with offline support!
                    </>
                  )}
                </p>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm text-white transition shadow-lg shadow-emerald-900/30"
              >
                {isBn ? 'ঠিক আছে' : 'Got it'}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import QRSessionClient from './[qrToken]/QRSessionClient';
import { Loader2 } from 'lucide-react';

function QRPageInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <p className="text-gray-600 text-lg">رمز QR غير صالح</p>
        </div>
      </div>
    );
  }

  return <QRSessionClient qrToken={token} />;
}

export default function QRPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
      }
    >
      <QRPageInner />
    </Suspense>
  );
}

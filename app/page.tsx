// app/page.tsx
'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // TSun-Authenticator ka landing page nahi hai, seedha login par bhej do!
    router.replace('/auth');
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-tsun-bg text-white">
      <p className="text-xl font-medium">Redirecting to Login... 🚀</p>
    </div>
  );
}
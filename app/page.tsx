// app/page.tsx
'use client'

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import '../styles/loading.css';

export default function HomePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000); // Minimum loading time

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      router.replace('/auth');
    }
  }, [loading, router]);

  return (
    <div className={`loading-screen ${!loading ? 'fade-out' : ''}`}>
      <div className="art-container">
        <div className="background-movement"></div>
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>
    </div>
  );
}

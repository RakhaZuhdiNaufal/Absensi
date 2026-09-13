'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SuperAdminPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/admin');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#f9f8f3] flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-[#57564F] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { CustomLoader } from '@/components/ui/custom-loader';

export default function AdminKurasiRedirect() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace('/dashboard/kurasi');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <CustomLoader size="md" label="MENGALIHKAN KE MEJA KURASI DASBOR..." />
    </div>
  );
}

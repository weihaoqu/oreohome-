'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import BatchScanPage from '@/components/pages/BatchScanPage';
import { use } from 'react';

export default function BatchScan({ params }: { params: Promise<{ locationId: string }> }) {
  const { locationId } = use(params);
  return (
    <InventoryProvider>
      <Layout>
        <BatchScanPage locationId={locationId} />
      </Layout>
    </InventoryProvider>
  );
}

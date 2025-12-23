'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import LocationDetailPage from '@/pages/LocationDetailPage';
import { use } from 'react';

export default function LocationDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <InventoryProvider>
      <Layout>
        <LocationDetailPage locationId={id} />
      </Layout>
    </InventoryProvider>
  );
}

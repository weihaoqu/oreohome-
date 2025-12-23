'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import LocationFormPage from '@/components/pages/LocationFormPage';
import { use } from 'react';

export default function EditLocation({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <InventoryProvider>
      <Layout>
        <LocationFormPage editId={id} />
      </Layout>
    </InventoryProvider>
  );
}

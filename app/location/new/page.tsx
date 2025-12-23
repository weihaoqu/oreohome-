'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import LocationFormPage from '@/pages/LocationFormPage';

export default function NewLocation() {
  return (
    <InventoryProvider>
      <Layout>
        <LocationFormPage />
      </Layout>
    </InventoryProvider>
  );
}

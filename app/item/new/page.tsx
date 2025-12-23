'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import ItemFormPage from '@/pages/ItemFormPage';

export default function NewItem() {
  return (
    <InventoryProvider>
      <Layout>
        <ItemFormPage />
      </Layout>
    </InventoryProvider>
  );
}

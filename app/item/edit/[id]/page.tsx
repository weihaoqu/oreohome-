'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import ItemFormPage from '@/pages/ItemFormPage';
import { use } from 'react';

export default function EditItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <InventoryProvider>
      <Layout>
        <ItemFormPage editId={id} />
      </Layout>
    </InventoryProvider>
  );
}

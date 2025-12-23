'use client';

import { Suspense, use } from 'react';
import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import ItemFormPage from '@/components/pages/ItemFormPage';

export default function EditItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return (
    <InventoryProvider>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div></div>}>
          <ItemFormPage editId={id} />
        </Suspense>
      </Layout>
    </InventoryProvider>
  );
}

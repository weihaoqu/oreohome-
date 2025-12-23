'use client';

import { Suspense } from 'react';
import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import ItemFormPage from '@/components/pages/ItemFormPage';

export default function NewItem() {
  return (
    <InventoryProvider>
      <Layout>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-pink-500 border-t-transparent"></div></div>}>
          <ItemFormPage />
        </Suspense>
      </Layout>
    </InventoryProvider>
  );
}

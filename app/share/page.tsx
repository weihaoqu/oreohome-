'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import SharePage from '@/pages/SharePage';

export default function Share() {
  return (
    <InventoryProvider>
      <Layout>
        <SharePage />
      </Layout>
    </InventoryProvider>
  );
}

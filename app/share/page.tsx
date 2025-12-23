'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import SharePage from '@/components/pages/SharePage';

export default function Share() {
  return (
    <InventoryProvider>
      <Layout>
        <SharePage />
      </Layout>
    </InventoryProvider>
  );
}

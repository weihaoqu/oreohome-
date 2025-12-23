'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import PromptHistoryPage from '@/pages/PromptHistoryPage';

export default function History() {
  return (
    <InventoryProvider>
      <Layout>
        <PromptHistoryPage />
      </Layout>
    </InventoryProvider>
  );
}

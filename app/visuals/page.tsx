'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import VisualSummaryPage from '@/pages/VisualSummaryPage';

export default function VisualsPage() {
  return (
    <InventoryProvider>
      <Layout>
        <VisualSummaryPage />
      </Layout>
    </InventoryProvider>
  );
}

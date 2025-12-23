'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import SearchPage from '@/components/pages/SearchPage';

export default function Search() {
  return (
    <InventoryProvider>
      <Layout>
        <SearchPage />
      </Layout>
    </InventoryProvider>
  );
}

'use client';

import { InventoryProvider } from '@/context/InventoryContext';
import Layout from '@/components/Layout';
import HomePage from '@/pages/HomePage';
import PWARegister from '@/components/PWARegister';

export default function Home() {
  return (
    <>
      <PWARegister />
      <InventoryProvider>
        <Layout>
          <HomePage />
        </Layout>
      </InventoryProvider>
    </>
  );
}

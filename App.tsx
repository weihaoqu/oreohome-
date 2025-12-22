
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { InventoryProvider } from './context/InventoryContext';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import LocationDetailPage from './pages/LocationDetailPage';
import LocationFormPage from './pages/LocationFormPage';
import ItemFormPage from './pages/ItemFormPage';
import SearchPage from './pages/SearchPage';
import SharePage from './pages/SharePage';
import VisualSummaryPage from './pages/VisualSummaryPage';
import BatchScanPage from './pages/BatchScanPage';

const App: React.FC = () => {
  return (
    <InventoryProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/visuals" element={<VisualSummaryPage />} />
            <Route path="/location/new" element={<LocationFormPage />} />
            <Route path="/location/edit/:id" element={<LocationFormPage />} />
            <Route path="/location/:id" element={<LocationDetailPage />} />
            <Route path="/batch-scan/:locationId" element={<BatchScanPage />} />
            <Route path="/item/new" element={<ItemFormPage />} />
            <Route path="/item/edit/:id" element={<ItemFormPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/share" element={<SharePage />} />
          </Routes>
        </Layout>
      </Router>
    </InventoryProvider>
  );
};

export default App;

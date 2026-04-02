import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { SkeletonCard } from './components/ui/SkeletonCard';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));

function PageFallback() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <Suspense fallback={<PageFallback />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="/transactions"
            element={
              <Suspense fallback={<PageFallback />}>
                <TransactionsPage />
              </Suspense>
            }
          />
          <Route
            path="/insights"
            element={
              <Suspense fallback={<PageFallback />}>
                <InsightsPage />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

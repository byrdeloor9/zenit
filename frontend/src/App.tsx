import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Layout } from './components/layout/Layout'
import {
  LoginPage,
  RegisterPage,
  ProfilePage,
  DashboardPage,
  FinancialManagementPage,
  PlanningPage,
  AnalysisPage,
} from './pages'

function App(): JSX.Element {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        <BrowserRouter>
          <AuthProvider>
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfilePage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* New consolidated routes */}
            <Route
              path="/financial-management"
              element={
                <ProtectedRoute>
                  <Layout>
                    <FinancialManagementPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/planning"
              element={
                <ProtectedRoute>
                  <Layout>
                    <PlanningPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analysis"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalysisPage />
                  </Layout>
                </ProtectedRoute>
              }
            />

            {/* Legacy routes with redirects to new consolidated pages */}
            <Route
              path="/accounts"
              element={<Navigate to="/financial-management?tab=accounts" replace />}
            />
            <Route
              path="/transactions"
              element={<Navigate to="/financial-management?tab=transactions" replace />}
            />
            <Route
              path="/transfers"
              element={<Navigate to="/financial-management?tab=transfers" replace />}
            />
            <Route
              path="/categories"
              element={<Navigate to="/financial-management?tab=categories" replace />}
            />
            <Route
              path="/budgets"
              element={<Navigate to="/planning?tab=budgets" replace />}
            />
            <Route
              path="/goals"
              element={<Navigate to="/planning?tab=goals" replace />}
            />
            <Route
              path="/recurring-incomes"
              element={<Navigate to="/planning?tab=recurring-transactions" replace />}
            />
            <Route
              path="/recurring-transactions"
              element={<Navigate to="/planning?tab=recurring-transactions" replace />}
            />
            <Route
              path="/debts"
              element={<Navigate to="/planning?tab=debts" replace />}
            />
            <Route
              path="/projections"
              element={<Navigate to="/analysis?tab=projections" replace />}
            />

              {/* Catch all - redirect to dashboard */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </ThemeProvider>
  )
}

export default App


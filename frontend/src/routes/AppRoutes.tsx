import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { MainLayout } from "../layouts/MainLayout";
import { Spinner } from "../components/Spinner";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { DashboardPage } from "../pages/DashboardPage";
import { VacanciesPage } from "../pages/VacanciesPage";
import { ApplicationsPage } from "../pages/ApplicationsPage";
import { InterviewsPage } from "../pages/InterviewsPage";
import { OffersPage } from "../pages/OffersPage";
import { NotesPage } from "../pages/NotesPage";
import { OfferComparisonPage } from "../pages/OfferComparisonPage";
import { NotFoundPage } from "../pages/NotFoundPage";

function Protected({ children }: { children: React.ReactElement }) {
  const bootstrapped = useAuthStore((s) => s.bootstrapped);
  const user = useAuthStore((s) => s.user);
  if (!bootstrapped) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <MainLayout />
          </Protected>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="vacancies" element={<VacanciesPage />} />
        <Route path="applications" element={<ApplicationsPage />} />
        <Route path="interviews" element={<InterviewsPage />} />
        <Route path="offers" element={<OffersPage />} />
        <Route path="compare" element={<OfferComparisonPage />} />
        <Route path="notes" element={<NotesPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import { Loading } from "./components/StatCard";
import { useAuth } from "./hooks/useAuth";
import { Role } from "./types";
import { homeFor } from "./utils/format";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import { Privacy, Terms } from "./pages/Legal";
import StreetPage from "./pages/StreetPage";
import IncidentPage from "./pages/IncidentPage";
import CitizenDashboard from "./pages/citizen/Dashboard";
import ReportIssue from "./pages/citizen/ReportIssue";
import MyReports from "./pages/citizen/MyReports";
import ReportDetails from "./pages/citizen/ReportDetails";
import Nearby from "./pages/citizen/Nearby";
import MunicipalDashboard from "./pages/municipal/Dashboard";
import WorkQueue from "./pages/municipal/WorkQueue";
import WorkOrder from "./pages/municipal/WorkOrder";
import AdminDashboard from "./pages/admin/Dashboard";
import Incidents from "./pages/admin/Incidents";
import IncidentDetails from "./pages/admin/IncidentDetails";
import VerificationQueue from "./pages/admin/VerificationQueue";
import Analytics from "./pages/admin/Analytics";
import Users from "./pages/admin/Users";

function Guard({ role }: { role?: Role }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading />;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to={homeFor(user.role)} replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route element={<Guard />}>
        <Route element={<Layout />}>
          <Route path="/incident/:id" element={<IncidentPage />} />
          <Route path="/street/:streetId" element={<StreetPage />} />
          <Route element={<Guard role="CITIZEN" />}>
            <Route path="/citizen" element={<CitizenDashboard />} />
            <Route path="/citizen/report" element={<ReportIssue />} />
            <Route path="/citizen/reports" element={<MyReports />} />
            <Route path="/citizen/reports/:id" element={<ReportDetails />} />
            <Route path="/citizen/nearby" element={<Nearby />} />
          </Route>
          <Route element={<Guard role="MUNICIPAL_MEMBER" />}>
            <Route path="/municipal" element={<MunicipalDashboard />} />
            <Route path="/municipal/work" element={<WorkQueue />} />
            <Route path="/municipal/work/:id" element={<WorkOrder />} />
          </Route>
          <Route element={<Guard role="ADMIN" />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/incidents" element={<Incidents />} />
            <Route path="/admin/incidents/:id" element={<IncidentDetails />} />
            <Route path="/admin/verification" element={<VerificationQueue />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/users" element={<Users />} />
          </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

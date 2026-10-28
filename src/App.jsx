
import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import PatientsPage from "./pages/PatientsPage";
import NursingRecordsPage from "./pages/NursingRecordsPage";
import DoctorOrdersPage from "./pages/DoctorOrdersPage";
import CarePlansPage from "./pages/CarePlansPage";
import HandoversPage from "./pages/HandoversPage";
import LoginPage from "./pages/LoginPage";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("nurseflow_token");

  return token ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="patients" element={<PatientsPage />} />
        <Route path="nursing-records" element={<NursingRecordsPage />} />
        <Route path="doctor-orders" element={<DoctorOrdersPage />} />
        <Route path="care-plans" element={<CarePlansPage />} />
        <Route path="handovers" element={<HandoversPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

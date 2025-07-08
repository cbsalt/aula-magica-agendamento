import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import i18n from "./lib/i18n";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

// Pages
import Booking from "./pages/Booking";
import Payment from "./pages/Payment";
import PublicBooking from "./pages/PublicBooking";
import Dashboard from "./pages/Dashboard";
import AuthCallback from "./pages/AuthCallback";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/" element={<Booking />} />
              <Route path="/payment" element={<Payment />} />
              <Route path="/aula/:teacherId" element={<PublicBooking />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;

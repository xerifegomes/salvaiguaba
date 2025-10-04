import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import AuthCallback from "@/react-app/pages/AuthCallback";
import MyOrders from "@/react-app/pages/MyOrders";
import MerchantDashboard from "@/react-app/pages/MerchantDashboard";
import AdminDashboard from "@/react-app/pages/AdminDashboard";
import RegisterEstablishment from "@/react-app/pages/RegisterEstablishment";
import PaymentPage from "@/react-app/pages/PaymentPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/merchant" element={<MerchantDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/register-establishment" element={<RegisterEstablishment />} />
        <Route path="/payment/:orderId" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

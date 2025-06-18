// App.jsx - Slightly improved version
import React from 'react'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import AdminDashboard from "./pages/AdminDashboard";
import "./assets/tailwind.css";


const HomePage = React.lazy(() => import("./pages/HomePage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Halaman Dashboard Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route 
          path="/" 
          element={
            <CustomerLayout>
              <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="text-xl">Loading...</div>
                </div>
              }>
                <HomePage />
              </React.Suspense>
            </CustomerLayout>
          } 
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
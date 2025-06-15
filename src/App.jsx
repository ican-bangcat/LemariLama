// App.jsx - Slightly improved version
import React from 'react'
import { Routes, Route, BrowserRouter } from "react-router-dom";
import CustomerLayout from "./layouts/CustomerLayout";
import "./assets/tailwind.css";


const HomePage = React.lazy(() => import("./pages/HomePage"));

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
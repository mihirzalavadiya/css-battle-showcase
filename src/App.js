import React, { useState, createContext, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import BattleDetail from './components/BattleDetail';
import AdminPanel from './components/AdminPanel';
import Login from './components/Login';
import './App.css';

export const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('isAdminAuthenticated') === 'true'
  );

  const login = () => {
    localStorage.setItem('isAdminAuthenticated', 'true');
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('isAdminAuthenticated');
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/battle/:id" element={<BattleDetail />} />
              <Route 
                path="/login" 
                element={isAuthenticated ? <Navigate to="/admin" replace /> : <Login />} 
              />
              <Route 
                path="/admin/*" 
                element={
                  isAuthenticated 
                    ? <AdminPanel />
                    : <Navigate to="/login" replace />
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthContext.Provider>
  );
}

export default App;

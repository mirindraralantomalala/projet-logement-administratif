// PrivateRoute.tsx
import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  children: React.ReactNode; // Déclarez les children ici
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('auth'); // Vérifiez l'authentification

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // Redirige vers la page de connexion
  }

  return <>{children};</>; // Affiche les enfants si authentifié
};

export default PrivateRoute;

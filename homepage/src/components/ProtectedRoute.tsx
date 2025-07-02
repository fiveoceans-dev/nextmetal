
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // Disabled authentication - allow all access for UI testing
  return <>{children}</>;
};

export default ProtectedRoute;

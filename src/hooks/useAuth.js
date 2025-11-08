import { useState, useEffect } from 'react';
import { userServices } from '../services/userServices';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const currentUser = userServices.getCurrentUser();
      console.log('🔍 useAuth - Usuario actual:', currentUser);
      setUser(currentUser);
      setLoading(false);
    };

    checkAuth();

    // Escuchar cambios en localStorage
    const handleStorageChange = () => {
      console.log('🔄 useAuth - Cambio en localStorage detectado');
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Verificar cada segundo (temporal para debug)
    const interval = setInterval(checkAuth, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return { user, loading };
};
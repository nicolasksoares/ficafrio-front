import { useState, useEffect } from 'react';
import { useAuth } from './useAuth'; 

export const useAdminRole = () => {
  const { user, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (user && user.type) {
      const userType = user.type.toLowerCase(); 
      setIsAdmin(userType === 'admin');
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  return { isAdmin, loading: isLoading };
};
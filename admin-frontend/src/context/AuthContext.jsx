import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('skillswap_admin_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    // Mock admin login - in real app, this would be an API call
    try {
      // Simple admin check
      if (email.includes('admin') && password === 'admin123') {
        const mockAdminUser = {
          id: 'admin-1',
          name: 'Admin User',
          email: email,
          role: 'ADMIN',
          permissions: ['USER_MANAGEMENT', 'CONTENT_MODERATION', 'ANALYTICS', 'DISPUTE_RESOLUTION'],
          profile: {
            avatar: null,
            department: 'Platform Administration',
            lastLogin: new Date().toISOString()
          }
        };

        setUser(mockAdminUser);
        localStorage.setItem('skillswap_admin_user', JSON.stringify(mockAdminUser));
        setIsLoading(false);
        return true;
      } else if (email.includes('moderator') && password === 'mod123') {
        const mockModeratorUser = {
          id: 'mod-1',
          name: 'Moderator User',
          email: email,
          role: 'MODERATOR',
          permissions: ['CONTENT_MODERATION', 'DISPUTE_RESOLUTION'],
          profile: {
            avatar: null,
            department: 'Content Moderation',
            lastLogin: new Date().toISOString()
          }
        };

        setUser(mockModeratorUser);
        localStorage.setItem('skillswap_admin_user', JSON.stringify(mockModeratorUser));
        setIsLoading(false);
        return true;
      } else {
        setIsLoading(false);
        return false;
      }
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillswap_admin_user');
  };

  const value = {
    user,
    login,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

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
    const savedUser = localStorage.getItem('skillswap_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    
    // Mock login - in real app, this would be an API call
    try {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: email,
        profile: {
          location: 'San Francisco, CA',
          bio: 'Passionate about learning and sharing knowledge',
          isPublic: true,
          verified: true
        },
        skillsOffered: [
          {
            id: '1',
            skillName: 'React Development',
            category: 'Technology',
            level: 'Expert',
            description: 'Advanced React development with hooks and modern patterns',
            endorsed: true
          }
        ],
        skillsWanted: [
          {
            id: '2',
            skillName: 'UI/UX Design',
            category: 'Creative',
            level: 'Intermediate',
            description: 'Want to learn modern design principles',
            endorsed: false
          }
        ],
        reputation: {
          overallRating: 4.8,
          totalRatings: 24,
          trustScore: 95,
          badges: ['Expert Teacher', 'Reliable', 'Top Contributor']
        },
        credits: {
          earned: 150,
          spent: 75,
          balance: 75
        }
      };

      setUser(mockUser);
      localStorage.setItem('skillswap_user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email, password, name) => {
    setIsLoading(true);
    
    // Mock registration
    try {
      const newUser = {
        id: Math.random().toString(36).substr(2, 9),
        name: name,
        email: email,
        profile: {
          isPublic: true,
          verified: false
        },
        skillsOffered: [],
        skillsWanted: [],
        reputation: {
          overallRating: 0,
          totalRatings: 0,
          trustScore: 50,
          badges: []
        },
        credits: {
          earned: 0,
          spent: 0,
          balance: 10 // Welcome bonus
        }
      };

      setUser(newUser);
      localStorage.setItem('skillswap_user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('skillswap_user');
  };

  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('skillswap_user', JSON.stringify(updatedUser));
  };

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
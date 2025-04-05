import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the shape of the user object
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  image_url?: string;
  qualification?: string;
  experienceLevel?: string;
  educationalLevel?: string;
}

// Define the shape of the context value
interface UserContextType {
  user: User | null;
  fetchUserData: () => Promise<void>;
}

// Create the context with a default value
const UserContext = createContext<UserContextType>({
  user: null,
  fetchUserData: async () => {},
});

// Define the UserProvider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  const fetchUserData = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const response = await axios.get('http://localhost:8000/api/user', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user data:', error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => useContext(UserContext);
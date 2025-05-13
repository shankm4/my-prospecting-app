import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [userData, setUserData] = useState({
    name: '',
    status: '',
    goal: '',
    startDate: '',
    experience: '',
    value: '',
    language: 'fr',
    senderEmail: '',
    senderPassword: '',
    cvFile: null,
    otherFile: null,
    customSubject: '',
    customMessage: ''
  });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}


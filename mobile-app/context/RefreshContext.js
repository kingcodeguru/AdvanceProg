import React, { createContext, useState, useContext } from 'react';

const RefreshContext = createContext();

export const RefreshProvider = ({ children }) => {
  // We use a simple counter or boolean to signal updates
  const [refreshSignal, setRefreshSignal] = useState(false);

  const triggerRefresh = () => {
    setRefreshSignal(prev => !prev);
  };

  return (
    <RefreshContext.Provider value={{ refreshSignal, triggerRefresh }}>
      {children}
    </RefreshContext.Provider>
  );
};

export const useRefresh = () => useContext(RefreshContext);
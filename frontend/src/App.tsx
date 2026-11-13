import React from 'react';
import { FitCheckProvider } from './context/FitCheckContext';
import { AppShell } from './components/AppShell/AppShell';

export const App: React.FC = () => {
  return (
    <FitCheckProvider>
      <AppShell />
    </FitCheckProvider>
  );
};

export default App;

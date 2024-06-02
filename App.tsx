import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ContentView from './ContentView';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <ContentView />
    </SafeAreaProvider>
  );
};

export default App;
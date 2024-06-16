import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import ContentView from './ContentView';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1 }}>
        <ContentView />
      </View>
    </SafeAreaProvider>
  );
};

export default App;

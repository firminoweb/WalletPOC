// App.tsx
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {WalletProvider} from './src/context/WalletContext';
import HomeScreen from './src/screens/HomeScreen';
import AddCardScreen from './src/screens/AddCardScreen';
import CardDetailsScreen from './src/screens/CardDetailsScreen';
import {Card} from './src/types/Card';

export type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
  CardDetails: {card: Card};
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <WalletProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#6366f1',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}>
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{
              title: 'Minha Carteira',
              headerStyle: {
                backgroundColor: '#6366f1',
              },
            }}
          />
          <Stack.Screen
            name="AddCard"
            component={AddCardScreen}
            options={{
              title: 'Adicionar Cartão',
            }}
          />
          <Stack.Screen
            name="CardDetails"
            component={CardDetailsScreen}
            options={{
              title: 'Detalhes do Cartão',
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </WalletProvider>
  );
};

export default App;

// App.tsx - Atualizado para POC VISA Device Tokenization com Autenticação Celcoin
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {WalletProvider} from './src/context/WalletContext';
import {CelcoinAuthProvider} from './src/context/CelcoinAuthContext';
import HomeScreen from './src/screens/HomeScreen';
import AddCardScreen from './src/screens/AddCardScreen';
import CardDetailsScreen from './src/screens/CardDetailsScreen';
import VISATokenizationScreen from './src/screens/VISATokenizationScreen';
import VISAResultScreen from './src/screens/VISAResultScreen';
import AuthStatusScreen from './src/screens/AuthStatusScreen';
import {Card} from './src/types/Card';
import {VISATokenizationResult} from './src/services/CelcoinTokenizationService';

export type RootStackParamList = {
  AuthStatus: undefined;
  Home: undefined;
  AddCard: undefined;
  CardDetails: {card: Card};
  VISATokenization: undefined;
  VISAResult: {result: VISATokenizationResult};
};

const Stack = createStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <CelcoinAuthProvider autoAuthenticate={true}>
      <WalletProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="AuthStatus"
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1434a4', // Cor VISA
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}>
            
            {/* ✅ NOVA: Tela de Status de Autenticação */}
            <Stack.Screen
              name="AuthStatus"
              component={AuthStatusScreen}
              options={{
                title: 'Conectando Celcoin...',
                headerStyle: {
                  backgroundColor: '#1434a4',
                },
                headerLeft: () => null, // Remove botão voltar
              }}
            />
            
            {/* Tela Principal da Wallet */}
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{
                title: 'VISA POC - Wallet',
                headerStyle: {
                  backgroundColor: '#1434a4',
                },
                headerLeft: () => null, // Remove botão voltar da Home
              }}
            />
            
            {/* Tela de Adicionar Cartão (método tradicional) */}
            <Stack.Screen
              name="AddCard"
              component={AddCardScreen}
              options={{
                title: 'Adicionar Cartão',
              }}
            />
            
            {/* Detalhes do Cartão */}
            <Stack.Screen
              name="CardDetails"
              component={CardDetailsScreen}
              options={{
                title: 'Detalhes do Cartão',
              }}
            />
            
            {/* Tela de Device Tokenization VISA */}
            <Stack.Screen
              name="VISATokenization"
              component={VISATokenizationScreen}
              options={{
                title: 'VISA Device Tokenization',
                headerStyle: {
                  backgroundColor: '#1434a4',
                },
              }}
            />
            
            {/* Resultado da Tokenização VISA */}
            <Stack.Screen
              name="VISAResult"
              component={VISAResultScreen}
              options={{
                title: 'Resultado VISA',
                headerStyle: {
                  backgroundColor: '#1434a4',
                },
              }}
            />
            
          </Stack.Navigator>
        </NavigationContainer>
      </WalletProvider>
    </CelcoinAuthProvider>
  );
};

export default App;

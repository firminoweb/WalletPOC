// src/context/EnhancedWalletContext.tsx
import React, {createContext, useContext, useReducer, ReactNode} from 'react';
import {TokenizedCard, DeviceInfo} from '../types/TokenizedCard';
import {TokenizationService} from '../services/TokenizationService';

interface WalletState {
  cards: TokenizedCard[];
  deviceInfo: DeviceInfo;
  isLoading: boolean;
  lastTokenizationResult?: any;
}

type WalletAction =
  | {type: 'ADD_CARD_START'}
  | {type: 'ADD_CARD_SUCCESS'; payload: TokenizedCard}
  | {type: 'ADD_CARD_FAILED'; payload: string}
  | {type: 'REMOVE_CARD'; payload: string}
  | {type: 'UPDATE_CARD_STATUS'; payload: {id: string; status: string}}
  | {type: 'SET_TOKENIZATION_RESULT'; payload: any};

interface WalletContextType {
  cards: TokenizedCard[];
  deviceInfo: DeviceInfo;
  isLoading: boolean;
  lastTokenizationResult?: any;
  addCard: (cardData: any) => Promise<void>;
  removeCard: (cardId: string) => void;
  updateCardStatus: (cardId: string, status: string) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Device info simulado (em produção viria do sistema)
const mockDeviceInfo: DeviceInfo = {
  deviceId: 'DEVICE_' + Math.random().toString(36).substr(2, 9),
  deviceName: 'Samsung Galaxy S23',
  osVersion: 'Android 14',
  appVersion: '1.0.0',
  hasNfc: true,
  hasBiometrics: true,
  riskScore: 85 // Score alto = dispositivo confiável
};

const initialState: WalletState = {
  cards: [
    {
      id: '1',
      maskedPan: '**** **** **** 9012',
      paymentToken: '4000123456789012',
      holder: 'João Silva',
      expiry: '12/28',
      tokenProvider: 'GOOGLE_PAY',
      tokenStatus: 'ACTIVE',
      brand: 'visa',
      issuerBin: '453210',
      lastFour: '9012',
      riskScore: 85,
      authenticationPath: 'GREEN',
      verificationStatus: 'VERIFIED',
      color: '#1e40af',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
      lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
      deviceInfo: mockDeviceInfo,
      transactionCount: 12,
      supportedMethods: [
        {type: 'NFC', enabled: true, supportedNetworks: ['CIELO', 'REDE']},
        {type: 'QR_CODE', enabled: true, supportedNetworks: ['GETNET', 'CIELO']},
        {type: 'E_COMMERCE', enabled: true, supportedNetworks: ['CIELO', 'REDE', 'GETNET']}
      ]
    }
  ],
  deviceInfo: mockDeviceInfo,
  isLoading: false
};

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'ADD_CARD_START':
      return {
        ...state,
        isLoading: true
      };
    case 'ADD_CARD_SUCCESS':
      return {
        ...state,
        cards: [...state.cards, action.payload],
        isLoading: false
      };
    case 'ADD_CARD_FAILED':
      return {
        ...state,
        isLoading: false
      };
    case 'REMOVE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload)
      };
    case 'UPDATE_CARD_STATUS':
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload.id
            ? {...card, tokenStatus: action.payload.status as any}
            : card
        )
      };
    case 'SET_TOKENIZATION_RESULT':
      return {
        ...state,
        lastTokenizationResult: action.payload
      };
    default:
      return state;
  }
};

interface WalletProviderProps {
  children: ReactNode;
}

// Helper function para extrair mensagem de erro de forma segura
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido na tokenização';
};

export const EnhancedWalletProvider: React.FC<WalletProviderProps> = ({children}) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const addCard = async (cardData: any): Promise<void> => {
    dispatch({type: 'ADD_CARD_START'});
    
    try {
      // 1. Validação inicial do cartão
      const validation = TokenizationService.validateForTokenization(cardData);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
      
      // 2. Avaliação de risco
      const riskAssessment = TokenizationService.evaluateRisk(cardData, state.deviceInfo);
      
      dispatch({type: 'SET_TOKENIZATION_RESULT', payload: {
        riskAssessment,
        validation
      }});
      
      // 3. Se caminho RED, rejeita imediatamente
      if (riskAssessment.authenticationPath === 'RED') {
        throw new Error('Tokenização negada: ' + riskAssessment.reason);
      }
      
      // 4. Se caminho YELLOW, requer verificação (simulamos que foi feita)
      let verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED' = 'VERIFIED';
      let verificationMethod: 'SMS_OTP' | 'EMAIL_OTP' | 'APP_TO_APP' | undefined;
      
      if (riskAssessment.authenticationPath === 'YELLOW') {
        verificationStatus = 'PENDING'; // Em uma app real, abriria tela de verificação
        verificationMethod = 'SMS_OTP';
      }
      
      // 5. Gera token (simulado)
      const paymentToken = TokenizationService.generatePaymentToken();
      
      // 6. Cria cartão tokenizado
      const newCard: TokenizedCard = {
        id: Date.now().toString(),
        maskedPan: `**** **** **** ${cardData.number.slice(-4)}`,
        paymentToken,
        holder: cardData.holder.trim(),
        expiry: cardData.expiry,
        tokenProvider: 'GOOGLE_PAY',
        tokenStatus: verificationStatus === 'VERIFIED' ? 'ACTIVE' : 'SUSPENDED',
        brand: cardData.brand,
        issuerBin: cardData.number.slice(0, 6),
        lastFour: cardData.number.slice(-4),
        riskScore: riskAssessment.riskScore,
        authenticationPath: riskAssessment.authenticationPath,
        verificationMethod,
        verificationStatus,
        color: cardData.color,
        createdAt: new Date(),
        deviceInfo: state.deviceInfo,
        transactionCount: 0,
        supportedMethods: [
          {type: 'NFC', enabled: true, supportedNetworks: ['CIELO', 'REDE']},
          {type: 'QR_CODE', enabled: true, supportedNetworks: ['GETNET', 'CIELO']},
          {type: 'E_COMMERCE', enabled: true, supportedNetworks: ['CIELO', 'REDE', 'GETNET']}
        ]
      };
      
      // Simula delay da rede
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      dispatch({type: 'ADD_CARD_SUCCESS', payload: newCard});
      
    } catch (error) {
      // ✅ CORRIGIDO: Extrair mensagem de erro de forma segura
      const errorMessage = getErrorMessage(error);
      dispatch({type: 'ADD_CARD_FAILED', payload: errorMessage});
      throw error;
    }
  };

  const removeCard = (cardId: string) => {
    dispatch({type: 'REMOVE_CARD', payload: cardId});
  };

  const updateCardStatus = (cardId: string, status: string) => {
    dispatch({type: 'UPDATE_CARD_STATUS', payload: {id: cardId, status}});
  };

  return (
    <WalletContext.Provider
      value={{
        cards: state.cards,
        deviceInfo: state.deviceInfo,
        isLoading: state.isLoading,
        lastTokenizationResult: state.lastTokenizationResult,
        addCard,
        removeCard,
        updateCardStatus,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useEnhancedWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useEnhancedWallet must be used within an EnhancedWalletProvider');
  }
  return context;
};

// src/context/WalletContext.tsx
import React, {createContext, useContext, useReducer, ReactNode} from 'react';
import {Card} from '../types/Card';

interface WalletState {
  cards: Card[];
}

type WalletAction =
  | {type: 'ADD_CARD'; payload: Card}
  | {type: 'REMOVE_CARD'; payload: string}
  | {type: 'UPDATE_CARD'; payload: Card};

interface WalletContextType {
  cards: Card[];
  addCard: (card: Omit<Card, 'id'>) => void;
  removeCard: (cardId: string) => void;
  updateCard: (card: Card) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const initialState: WalletState = {
  cards: [
    {
      id: '1',
      number: '4532 1234 5678 9012',
      holder: 'João Silva',
      expiry: '12/28',
      cvv: '123',
      brand: 'visa',
      color: '#1e40af',
      createdAt: new Date(),
      isActive: true,
    },
  ],
};

const walletReducer = (state: WalletState, action: WalletAction): WalletState => {
  switch (action.type) {
    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, action.payload],
      };
    case 'REMOVE_CARD':
      return {
        ...state,
        cards: state.cards.filter(card => card.id !== action.payload),
      };
    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map(card =>
          card.id === action.payload.id ? action.payload : card,
        ),
      };
    default:
      return state;
  }
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({children}) => {
  const [state, dispatch] = useReducer(walletReducer, initialState);

  const addCard = (card: Omit<Card, 'id'>) => {
    const newCard: Card = {
      ...card,
      id: Date.now().toString(),
      createdAt: new Date(),
      isActive: true,
    };
    dispatch({type: 'ADD_CARD', payload: newCard});
  };

  const removeCard = (cardId: string) => {
    dispatch({type: 'REMOVE_CARD', payload: cardId});
  };

  const updateCard = (card: Card) => {
    dispatch({type: 'UPDATE_CARD', payload: card});
  };

  return (
    <WalletContext.Provider
      value={{
        cards: state.cards,
        addCard,
        removeCard,
        updateCard,
      }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextType => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

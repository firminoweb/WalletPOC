// src/context/CelcoinAuthContext.tsx
import React, {createContext, useContext, useReducer, useEffect, useCallback, ReactNode} from 'react';
import {CelcoinAuthService, CelcoinAuthResponse} from '../services/CelcoinAuthService';

interface CelcoinAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken?: string;
  tokenType?: string;
  expiresAt?: Date;
  error?: string;
  lastAuthAttempt?: Date;
  connectionStatus: 'unknown' | 'connected' | 'disconnected';
}

type CelcoinAuthAction =
  | {type: 'AUTH_START'}
  | {type: 'AUTH_SUCCESS'; payload: CelcoinAuthResponse}
  | {type: 'AUTH_FAILURE'; payload: string}
  | {type: 'AUTH_RESET'}
  | {type: 'CONNECTION_TEST'; payload: boolean}
  | {type: 'TOKEN_REFRESH_START'}
  | {type: 'TOKEN_EXPIRED'};

interface CelcoinAuthContextType {
  // Estado
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken?: string;
  tokenType?: string;
  expiresAt?: Date;
  error?: string;
  connectionStatus: 'unknown' | 'connected' | 'disconnected';
  
  // Ações
  authenticate: () => Promise<boolean>;
  refreshToken: () => Promise<boolean>;
  logout: () => void;
  getAuthHeaders: () => Record<string, string>;
  isTokenValid: () => boolean;
  getTimeRemaining: () => number;
}

const CelcoinAuthContext = createContext<CelcoinAuthContextType | undefined>(undefined);

const initialState: CelcoinAuthState = {
  isAuthenticated: false,
  isLoading: false,
  connectionStatus: 'unknown'
};

const authReducer = (state: CelcoinAuthState, action: CelcoinAuthAction): CelcoinAuthState => {
  switch (action.type) {
    case 'AUTH_START':
    case 'TOKEN_REFRESH_START':
      return {
        ...state,
        isLoading: true,
        error: undefined
      };

    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload.success,
        accessToken: action.payload.accessToken,
        tokenType: action.payload.tokenType,
        expiresAt: action.payload.expiresAt,
        error: action.payload.success ? undefined : action.payload.error,
        lastAuthAttempt: new Date()
      };

    case 'AUTH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        accessToken: undefined,
        tokenType: undefined,
        expiresAt: undefined,
        error: action.payload,
        lastAuthAttempt: new Date()
      };

    case 'AUTH_RESET':
    case 'TOKEN_EXPIRED':
      return {
        ...state,
        isAuthenticated: false,
        accessToken: undefined,
        tokenType: undefined,
        expiresAt: undefined,
        error: action.type === 'TOKEN_EXPIRED' ? 'Token expirado' : undefined
      };

    case 'CONNECTION_TEST':
      return {
        ...state,
        connectionStatus: action.payload ? 'connected' : 'disconnected'
      };

    default:
      return state;
  }
};

interface CelcoinAuthProviderProps {
  children: ReactNode;
  autoAuthenticate?: boolean;
}

export const CelcoinAuthProvider: React.FC<CelcoinAuthProviderProps> = ({
  children,
  autoAuthenticate = true
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Autenticação principal
  const authenticate = useCallback(async (): Promise<boolean> => {
    console.log('🚀 [CELCOIN-AUTH-CONTEXT] Iniciando autenticação...');
    
    dispatch({type: 'AUTH_START'});

    try {
      const authResponse = await CelcoinAuthService.authenticate();
      dispatch({type: 'AUTH_SUCCESS', payload: authResponse});
      
      if (authResponse.success) {
        console.log('✅ [CELCOIN-AUTH-CONTEXT] Autenticação bem-sucedida');
        return true;
      } else {
        console.log('❌ [CELCOIN-AUTH-CONTEXT] Falha na autenticação');
        return false;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('❌ [CELCOIN-AUTH-CONTEXT] Erro na autenticação:', errorMessage);
      dispatch({type: 'AUTH_FAILURE', payload: errorMessage});
      return false;
    }
  }, []);

  // Renovação de token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    console.log('🔄 [CELCOIN-AUTH-CONTEXT] Renovando token...');
    
    dispatch({type: 'TOKEN_REFRESH_START'});

    try {
      const currentAuth = state.accessToken ? {
        success: true,
        accessToken: state.accessToken,
        tokenType: state.tokenType,
        expiresAt: state.expiresAt
      } : undefined;

      const authResponse = await CelcoinAuthService.refreshTokenIfNeeded(currentAuth);
      dispatch({type: 'AUTH_SUCCESS', payload: authResponse});
      
      return authResponse.success;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao renovar token';
      dispatch({type: 'AUTH_FAILURE', payload: errorMessage});
      return false;
    }
  }, [state.accessToken, state.tokenType, state.expiresAt]);

  // Logout
  const logout = useCallback(() => {
    console.log('👋 [CELCOIN-AUTH-CONTEXT] Fazendo logout...');
    dispatch({type: 'AUTH_RESET'});
  }, []);

  // Geração de headers autenticados
  const getAuthHeaders = useCallback((): Record<string, string> => {
    if (!state.accessToken || !state.tokenType) {
      console.warn('⚠️ [CELCOIN-AUTH-CONTEXT] Token não disponível para headers');
      return {};
    }

    return CelcoinAuthService.generateAuthHeaders(state.accessToken, state.tokenType);
  }, [state.accessToken, state.tokenType]);

  // Verificação de validade do token
  const isTokenValid = useCallback((): boolean => {
    return CelcoinAuthService.isTokenValid(state.expiresAt);
  }, [state.expiresAt]);

  // Tempo restante do token
  const getTimeRemaining = useCallback((): number => {
    return CelcoinAuthService.getTokenTimeRemaining(state.expiresAt);
  }, [state.expiresAt]);

  // Teste de conectividade inicial
  const testConnection = useCallback(async () => {
    try {
      const isConnected = await CelcoinAuthService.testConnection();
      dispatch({type: 'CONNECTION_TEST', payload: isConnected});
    } catch (error) {
      console.error('❌ [CELCOIN-AUTH-CONTEXT] Erro ao testar conectividade:', error);
      dispatch({type: 'CONNECTION_TEST', payload: false});
    }
  }, []);

  // Efeito para autenticação automática
  useEffect(() => {
    if (autoAuthenticate) {
      const initializeAuth = async () => {
        console.log('🔧 [CELCOIN-AUTH-CONTEXT] Inicializando autenticação automática...');
        
        // Testa conectividade primeiro
        await testConnection();
        
        // Tenta autenticar
        await authenticate();
      };

      initializeAuth();
    }
  }, [autoAuthenticate, authenticate, testConnection]);

  // Efeito para monitoramento de expiração
  useEffect(() => {
    if (!state.expiresAt || !state.isAuthenticated) return;

    const checkTokenExpiration = () => {
      if (!isTokenValid()) {
        console.log('⏰ [CELCOIN-AUTH-CONTEXT] Token expirado detectado');
        dispatch({type: 'TOKEN_EXPIRED'});
      }
    };

    // Verifica a cada 30 segundos
    const interval = setInterval(checkTokenExpiration, 30000);

    // Cleanup
    return () => clearInterval(interval);
  }, [state.expiresAt, state.isAuthenticated, isTokenValid]);

  // Efeito para logs de debug
  useEffect(() => {
    if (state.isAuthenticated && state.expiresAt) {
      const timeRemaining = getTimeRemaining();
      console.log(`📊 [CELCOIN-AUTH-CONTEXT] Status: Autenticado | Tempo restante: ${timeRemaining} minutos`);
    }
  }, [state.isAuthenticated, state.expiresAt, getTimeRemaining]);

  const contextValue: CelcoinAuthContextType = {
    // Estado
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    accessToken: state.accessToken,
    tokenType: state.tokenType,
    expiresAt: state.expiresAt,
    error: state.error,
    connectionStatus: state.connectionStatus,
    
    // Ações
    authenticate,
    refreshToken,
    logout,
    getAuthHeaders,
    isTokenValid,
    getTimeRemaining
  };

  return (
    <CelcoinAuthContext.Provider value={contextValue}>
      {children}
    </CelcoinAuthContext.Provider>
  );
};

export const useCelcoinAuth = (): CelcoinAuthContextType => {
  const context = useContext(CelcoinAuthContext);
  if (!context) {
    throw new Error('useCelcoinAuth must be used within a CelcoinAuthProvider');
  }
  return context;
};

// Hook utilitário para verificação de status
export const useCelcoinAuthStatus = () => {
  const auth = useCelcoinAuth();
  
  return {
    isReady: auth.isAuthenticated && !auth.isLoading,
    needsAuth: !auth.isAuthenticated && !auth.isLoading,
    isLoading: auth.isLoading,
    hasError: !!auth.error,
    isConnected: auth.connectionStatus === 'connected',
    timeRemaining: auth.getTimeRemaining(),
    statusMessage: auth.error || 
                  (auth.isLoading ? 'Autenticando...' : 
                  (auth.isAuthenticated ? 'Conectado' : 'Desconectado'))
  };
};

// src/screens/AuthStatusScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useCelcoinAuth, useCelcoinAuthStatus} from '../context/CelcoinAuthContext';

type RootStackParamList = {
  AuthStatus: undefined;
  Home: undefined;
};

type AuthStatusScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AuthStatus'>;

interface Props {
  navigation: AuthStatusScreenNavigationProp;
}

const AuthStatusScreen: React.FC<Props> = ({navigation}) => {
  const auth = useCelcoinAuth();
  const status = useCelcoinAuthStatus();
  const [countdown, setCountdown] = useState(3);

  // Redirecionamento automático quando autenticado
  useEffect(() => {
    if (status.isReady) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            navigation.replace('Home');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status.isReady, navigation]);

  // Atualização do título da tela baseado no status
  useEffect(() => {
    let title = 'Conectando Celcoin...';
    
    if (status.hasError) {
      title = 'Erro de Conexão';
    } else if (status.isReady) {
      title = 'Conectado!';
    } else if (status.isLoading) {
      title = 'Autenticando...';
    }

    navigation.setOptions({title});
  }, [status, navigation]);

  const getStatusIcon = () => {
    if (status.isLoading) return '⏳';
    if (status.hasError) return '❌';
    if (status.isReady) return '✅';
    if (!status.isConnected) return '📡';
    return '🔧';
  };

  const getStatusColor = () => {
    if (status.hasError) return '#ef4444';
    if (status.isReady) return '#10b981';
    if (status.isLoading) return '#f59e0b';
    return '#6b7280';
  };

  const handleRetry = async () => {
    console.log('🔄 [AUTH-STATUS] Tentando reconectar...');
    await auth.authenticate();
  };

  const handleSkip = () => {
    console.log('⏭️ [AUTH-STATUS] Pulando autenticação...');
    navigation.replace('Home');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconContainer, {backgroundColor: getStatusColor()}]}>
            <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
          </View>
          <Text style={styles.title}>Celcoin API</Text>
          <Text style={styles.subtitle}>Autenticação para VISA Device Tokenization</Text>
        </View>

        {/* Status Principal */}
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>Status da Conexão</Text>
          <Text style={[styles.statusMessage, {color: getStatusColor()}]}>
            {status.statusMessage}
          </Text>
          
          {status.isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1434a4" />
              <Text style={styles.loadingText}>Conectando com Celcoin...</Text>
            </View>
          )}

          {status.isReady && (
            <View style={styles.successContainer}>
              <Text style={styles.successTitle}>🎉 Autenticação Realizada!</Text>
              <Text style={styles.successText}>
                Token válido por {status.timeRemaining} minutos
              </Text>
              <Text style={styles.countdownText}>
                Redirecionando em {countdown} segundos...
              </Text>
            </View>
          )}

          {status.hasError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>⚠️ Erro na Autenticação</Text>
              <Text style={styles.errorText}>{auth.error}</Text>
              <Text style={styles.errorHint}>
                Verifique sua conexão e tente novamente
              </Text>
            </View>
          )}
        </View>

        {/* Informações Técnicas */}
        <View style={styles.technicalCard}>
          <Text style={styles.technicalTitle}>Informações Técnicas</Text>
          
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Ambiente:</Text>
            <Text style={styles.technicalValue}>Sandbox</Text>
          </View>
          
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Endpoint:</Text>
            <Text style={styles.technicalValue}>sandbox.openfinance.celcoin.dev</Text>
          </View>
          
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Conectividade:</Text>
            <Text style={[
              styles.technicalValue,
              {color: status.isConnected ? '#10b981' : '#ef4444'}
            ]}>
              {status.isConnected ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          <View style={styles.technicalRow}>
            <Text style={styles.technicalLabel}>Integração:</Text>
            <Text style={styles.technicalValue}>VISA Device Tokenization</Text>
          </View>
          
          {auth.accessToken && (
            <View style={styles.technicalRow}>
              <Text style={styles.technicalLabel}>Token:</Text>
              <Text style={styles.technicalValue}>
                {auth.accessToken.slice(0, 20)}...
              </Text>
            </View>
          )}
        </View>

        {/* Compliance Info */}
        <View style={styles.complianceCard}>
          <Text style={styles.complianceTitle}>VISA Compliance</Text>
          <View style={styles.complianceItems}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>🏦</Text>
              <Text style={styles.complianceText}>Certificação VISA Brasil</Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>🔒</Text>
              <Text style={styles.complianceText}>PCI DSS Compliant</Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>📱</Text>
              <Text style={styles.complianceText}>Device Tokenization</Text>
            </View>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceIcon}>🛡️</Text>
              <Text style={styles.complianceText}>EMV Token Spec v2.0</Text>
            </View>
          </View>
        </View>

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {status.hasError && (
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetry}
            activeOpacity={0.8}>
            <Text style={styles.retryButtonText}>🔄 Tentar Novamente</Text>
          </TouchableOpacity>
        )}

        {(status.hasError || status.isLoading) && (
          <TouchableOpacity
            style={styles.skipButton}
            onPress={handleSkip}
            activeOpacity={0.8}>
            <Text style={styles.skipButtonText}>Pular Autenticação</Text>
          </TouchableOpacity>
        )}

        {status.isReady && (
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.replace('Home')}
            activeOpacity={0.8}>
            <Text style={styles.continueButtonText}>Continuar para Wallet</Text>
          </TouchableOpacity>
        )}
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: 20,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    fontSize: 36,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  statusMessage: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10b981',
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1434a4',
  },
  errorContainer: {
    paddingVertical: 20,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#dc2626',
    marginBottom: 8,
  },
  errorHint: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
  },
  technicalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  technicalTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  technicalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  technicalLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  technicalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  complianceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 100, // Espaço para botões
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  complianceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  complianceItems: {
    gap: 12,
  },
  complianceItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  complianceIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  complianceText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 12,
  },
  retryButton: {
    backgroundColor: '#1434a4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  continueButton: {
    backgroundColor: '#10b981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AuthStatusScreen;

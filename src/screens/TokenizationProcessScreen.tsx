// src/screens/TokenizationProcessScreen.tsx
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useEnhancedWallet} from '../context/EnhancedWalletContext';

// Tipos para navegação
type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
  TokenizationProcess: {cardData: any};
  CardDetails: {card: any};
};

type TokenizationProcessScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TokenizationProcess'>;
type TokenizationProcessScreenRouteProp = RouteProp<RootStackParamList, 'TokenizationProcess'>;

interface Props {
  route: TokenizationProcessScreenRouteProp;
  navigation: TokenizationProcessScreenNavigationProp;
}

// Helper function para extrair mensagem de erro de forma segura
const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return 'Erro desconhecido durante a tokenização';
};

const TokenizationProcessScreen: React.FC<Props> = ({route, navigation}) => {
  const {cardData} = route.params;
  const {addCard, lastTokenizationResult, isLoading} = useEnhancedWallet();
  const [currentStep, setCurrentStep] = useState(0);

  // Estados para verificação OTP (descomentados para uso futuro se necessário)
  // const [showVerification, setShowVerification] = useState(false);
  // const [otpCode, setOtpCode] = useState('');

  const steps = [
    'Validando cartão...',
    'Avaliando risco...',
    'Verificando com emissor...',
    'Gerando token...',
    'Finalizando...'
  ];

  useEffect(() => {
    processTokenization();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const processTokenization = async () => {
    try {
      // Simula progresso passo a passo
      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(i);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      await addCard(cardData);
      
      // Se chegou aqui, sucesso
      Alert.alert(
        'Tokenização Concluída! 🎉',
        'Seu cartão foi adicionado com sucesso e está pronto para uso.',
        [
          {text: 'Ver Cartões', onPress: () => navigation.navigate('Home')}
        ]
      );
      
    } catch (error) {
      // Extrair mensagem de erro de forma segura
      const errorMessage = getErrorMessage(error);
      Alert.alert(
        'Tokenização Falhou ❌',
        errorMessage,
        [
          {text: 'Tentar Novamente', onPress: processTokenization},
          {text: 'Cancelar', onPress: () => navigation.goBack()}
        ]
      );
    }
  };

  const getStepIcon = (index: number) => {
    if (index < currentStep) return '✅';
    if (index === currentStep) return '⏳';
    return '⏸️';
  };

  const getAuthPathInfo = (path: string) => {
    switch (path) {
      case 'GREEN':
        return {
          color: '#10b981',
          title: 'Caminho Verde ✅',
          description: 'Aprovação automática - Alto score de confiança'
        };
      case 'YELLOW':
        return {
          color: '#f59e0b',
          title: 'Caminho Amarelo ⚠️',
          description: 'Verificação adicional necessária - Score moderado'
        };
      case 'RED':
        return {
          color: '#ef4444',
          title: 'Caminho Vermelho ❌',
          description: 'Tokenização negada - Score baixo de confiança'
        };
      default:
        return {color: '#6b7280', title: 'Avaliando...', description: ''};
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return '#10b981'; // Verde
    if (score >= 40) return '#f59e0b'; // Amarelo  
    return '#ef4444'; // Vermelho
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Processo de Tokenização</Text>
          <Text style={styles.subtitle}>
            Seguindo padrões Google Pay Brasil
          </Text>
        </View>

        {/* Preview do cartão */}
        <View style={styles.cardPreview}>
          <View style={[styles.miniCard, {backgroundColor: cardData.color || '#6366f1'}]}>
            <View style={styles.miniCardHeader}>
              <Text style={styles.miniCardBrand}>
                {cardData.brand?.toUpperCase() || 'CARTÃO'}
              </Text>
              <View style={styles.miniChip} />
            </View>
            <Text style={styles.miniCardNumber}>
              **** **** **** {cardData.number?.slice(-4) || '****'}
            </Text>
            <View style={styles.miniCardFooter}>
              <Text style={styles.miniCardHolder}>
                {cardData.holder || 'NOME DO PORTADOR'}
              </Text>
              <Text style={styles.miniCardExpiry}>
                {cardData.expiry || 'MM/AA'}
              </Text>
            </View>
          </View>
        </View>

        {/* Progresso dos passos */}
        <View style={styles.stepsContainer}>
          <Text style={styles.sectionTitle}>Progresso da Tokenização</Text>
          {steps.map((step, index) => (
            <View key={index} style={styles.stepRow}>
              <Text style={styles.stepIcon}>{getStepIcon(index)}</Text>
              <Text style={[
                styles.stepText,
                index <= currentStep ? styles.stepActive : styles.stepInactive
              ]}>
                {step}
              </Text>
              {index === currentStep && isLoading && (
                <ActivityIndicator size="small" color="#6366f1" style={styles.stepLoader} />
              )}
            </View>
          ))}
        </View>

        {/* Resultado da avaliação de risco */}
        {lastTokenizationResult?.riskAssessment && (
          <View style={styles.riskAssessment}>
            <Text style={styles.sectionTitle}>Avaliação de Risco</Text>
            
            <View style={styles.riskCard}>
              <View style={styles.riskHeader}>
                {(() => {
                  const pathInfo = getAuthPathInfo(lastTokenizationResult.riskAssessment.authenticationPath);
                  return (
                    <>
                      <Text style={[styles.pathTitle, {color: pathInfo.color}]}>
                        {pathInfo.title}
                      </Text>
                      <Text style={styles.pathDescription}>
                        {pathInfo.description}
                      </Text>
                    </>
                  );
                })()}
              </View>
              
              <View style={styles.riskDetails}>
                <View style={styles.riskRow}>
                  <Text style={styles.riskLabel}>Score de Risco:</Text>
                  <Text style={[
                    styles.riskValue,
                    {color: getScoreColor(lastTokenizationResult.riskAssessment.riskScore)}
                  ]}>
                    {lastTokenizationResult.riskAssessment.riskScore}/100
                  </Text>
                </View>
                <View style={styles.riskRow}>
                  <Text style={styles.riskLabel}>Motivo:</Text>
                  <Text style={styles.riskReason}>
                    {lastTokenizationResult.riskAssessment.reason}
                  </Text>
                </View>
              </View>
              
              {/* Barra de progresso do score */}
              <View style={styles.scoreBar}>
                <View 
                  style={[
                    styles.scoreProgress, 
                    {
                      width: `${lastTokenizationResult.riskAssessment.riskScore}%`,
                      backgroundColor: getScoreColor(lastTokenizationResult.riskAssessment.riskScore)
                    }
                  ]} 
                />
              </View>
            </View>
          </View>
        )}

        {/* Validação do emissor */}
        {lastTokenizationResult?.validation && (
          <View style={styles.validation}>
            <Text style={styles.sectionTitle}>Resposta do Emissor</Text>
            <View style={styles.validationCard}>
              <Text style={[
                styles.validationStatus,
                {color: lastTokenizationResult.validation.isValid ? '#10b981' : '#ef4444'}
              ]}>
                {lastTokenizationResult.validation.isValid ? '✅ Aprovado' : '❌ Rejeitado'}
              </Text>
              <Text style={styles.validationResponse}>
                Resposta: {lastTokenizationResult.validation.issuerResponse}
              </Text>
              {lastTokenizationResult.validation.errors && lastTokenizationResult.validation.errors.length > 0 && (
                <View style={styles.errorsList}>
                  <Text style={styles.errorsTitle}>Erros encontrados:</Text>
                  {lastTokenizationResult.validation.errors.map((error: string, index: number) => (
                    <Text key={index} style={styles.errorItem}>• {error}</Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Informações do dispositivo */}
        <View style={styles.deviceInfo}>
          <Text style={styles.sectionTitle}>Informações do Dispositivo</Text>
          <View style={styles.deviceCard}>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>📱 Dispositivo:</Text>
              <Text style={styles.deviceValue}>Samsung Galaxy S23</Text>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>🔒 NFC:</Text>
              <Text style={styles.deviceValue}>✅ Disponível</Text>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>👆 Biometria:</Text>
              <Text style={styles.deviceValue}>✅ Disponível</Text>
            </View>
            <View style={styles.deviceRow}>
              <Text style={styles.deviceLabel}>🛡️ Score do Dispositivo:</Text>
              <Text style={[styles.deviceValue, {color: getScoreColor(85)}]}>85/100</Text>
            </View>
          </View>
        </View>

        {/* Métodos de pagamento suportados */}
        <View style={styles.paymentMethods}>
          <Text style={styles.sectionTitle}>Métodos de Pagamento</Text>
          <View style={styles.methodsGrid}>
            <View style={styles.methodCard}>
              <Text style={styles.methodIcon}>📱</Text>
              <Text style={styles.methodTitle}>NFC</Text>
              <Text style={styles.methodSubtitle}>Cielo, Rede</Text>
              <View style={styles.methodStatus}>
                <Text style={styles.methodStatusText}>✅ Ativo</Text>
              </View>
            </View>
            <View style={styles.methodCard}>
              <Text style={styles.methodIcon}>📲</Text>
              <Text style={styles.methodTitle}>QR Code</Text>
              <Text style={styles.methodSubtitle}>Getnet, Cielo</Text>
              <View style={styles.methodStatus}>
                <Text style={styles.methodStatusText}>✅ Ativo</Text>
              </View>
            </View>
            <View style={styles.methodCard}>
              <Text style={styles.methodIcon}>💳</Text>
              <Text style={styles.methodTitle}>E-commerce</Text>
              <Text style={styles.methodSubtitle}>Todos</Text>
              <View style={styles.methodStatus}>
                <Text style={styles.methodStatusText}>✅ Ativo</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Compliance e Certificações */}
        <View style={styles.compliance}>
          <Text style={styles.sectionTitle}>Conformidade Brasil</Text>
          <View style={styles.complianceCard}>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>🏦 Emissor Certificado:</Text>
              <Text style={styles.complianceValue}>✅ Sim</Text>
            </View>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>🔐 PCI DSS:</Text>
              <Text style={styles.complianceValue}>✅ Compliant</Text>
            </View>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>📊 Taxa de Sucesso:</Text>
              <Text style={styles.complianceValue}>✅90%</Text>
            </View>
            <View style={styles.complianceRow}>
              <Text style={styles.complianceLabel}>🇧🇷 Regulamentação:</Text>
              <Text style={styles.complianceValue}>✅ Bacen/PIX</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  cardPreview: {
    alignItems: 'center',
    marginVertical: 20,
  },
  miniCard: {
    width: 280,
    height: 140,
    borderRadius: 12,
    padding: 16,
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  miniCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  miniCardBrand: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  miniChip: {
    width: 24,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  miniCardNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    letterSpacing: 1,
  },
  miniCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCardHolder: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  miniCardExpiry: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  stepsContainer: {
    margin: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 16,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  stepIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  stepText: {
    fontSize: 14,
    flex: 1,
  },
  stepActive: {
    color: '#1f2937',
    fontWeight: '600',
  },
  stepInactive: {
    color: '#9ca3af',
  },
  stepLoader: {
    marginLeft: 8,
  },
  riskAssessment: {
    margin: 20,
    marginTop: 0,
  },
  riskCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  riskHeader: {
    marginBottom: 16,
  },
  pathTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  pathDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  riskDetails: {
    marginBottom: 16,
  },
  riskRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  riskLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  riskValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  riskReason: {
    fontSize: 14,
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  validation: {
    margin: 20,
    marginTop: 0,
  },
  validationCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  validationStatus: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  validationResponse: {
    fontSize: 14,
    color: '#6b7280',
  },
  errorsList: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorItem: {
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 4,
  },
  deviceInfo: {
    margin: 20,
    marginTop: 0,
  },
  deviceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  deviceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  paymentMethods: {
    margin: 20,
    marginTop: 0,
  },
  methodsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  methodCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  methodIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  methodTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  methodSubtitle: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  methodStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#f0fdf4',
    borderRadius: 4,
  },
  methodStatusText: {
    fontSize: 10,
    color: '#16a34a',
    fontWeight: '500',
  },
  compliance: {
    margin: 20,
    marginTop: 0,
    marginBottom: 40,
  },
  complianceCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  complianceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  complianceLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  complianceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#16a34a',
  },
});

export default TokenizationProcessScreen;

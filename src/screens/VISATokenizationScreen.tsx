// src/screens/VISATokenizationScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {CelcoinTokenizationService, VISATokenizationRequest, VISATokenizationResult} from '../services/CelcoinTokenizationService';

type RootStackParamList = {
  Home: undefined;
  VISATokenization: undefined;
  VISAResult: {result: VISATokenizationResult};
};

type VISATokenizationScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VISATokenization'>;

interface Props {
  navigation: VISATokenizationScreenNavigationProp;
}

interface FormData {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
}

const VISATokenizationScreen: React.FC<Props> = ({navigation}) => {
  const [formData, setFormData] = useState<FormData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<string>('');

  const formatCardNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ') : '';
  };

  const formatExpiryDate = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{0,2})$/);
    if (match) {
      return match[2] ? `${match[1]}/${match[2]}` : match[1];
    }
    return cleaned;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    } else if (field === 'cardholderName') {
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  };

  const validateForm = (): boolean => {
    const cleanCardNumber = formData.cardNumber.replace(/\s/g, '');
    
    if (!cleanCardNumber.startsWith('4')) {
      Alert.alert('Erro VISA', 'Esta POC aceita apenas cartões VISA (começando com 4)');
      return false;
    }
    
    if (cleanCardNumber.length < 16) {
      Alert.alert('Erro', 'Número do cartão deve ter 16 dígitos');
      return false;
    }
    
    if (!formData.cardholderName.trim()) {
      Alert.alert('Erro', 'Nome do portador é obrigatório');
      return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(formData.expiryDate)) {
      Alert.alert('Erro', 'Data de expiração inválida (MM/AA)');
      return false;
    }
    
    if (formData.cvv.length !== 3) {
      Alert.alert('Erro', 'CVV deve ter 3 dígitos');
      return false;
    }
    
    return true;
  };

  const handleTokenizeCard = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      // Simular passos do processo VISA
      const steps = [
        'Verificando elegibilidade do dispositivo...',
        'Validando cartão VISA...',
        'Conectando com Celcoin/Pismo...',
        'Processando tokenização...',
        'Validando compliance VISA Brasil...',
        'Finalizando...'
      ];

      for (let i = 0; i < steps.length; i++) {
        setCurrentStep(steps[i]);
        await new Promise(resolve => setTimeout(resolve, 800));
      }

      const request: VISATokenizationRequest = {
        cardNumber: formData.cardNumber.replace(/\s/g, ''),
        cardholderName: formData.cardholderName.trim(),
        expiryDate: formData.expiryDate,
        cvv: formData.cvv
      };

      const result = await CelcoinTokenizationService.tokenizeCard(request);
      
      setIsLoading(false);
      setCurrentStep('');

      if (result.success) {
        Alert.alert(
          'VISA Tokenização Concluída! 🎉',
          `Device Token criado com sucesso.\n\nToken ID: ${result.tokenId}\nDevice Token: ${result.deviceTokenId}\n\nTempo: ${result.processingTime}ms`,
          [
            {text: 'Ver Detalhes', onPress: () => navigation.navigate('VISAResult', {result})},
            {text: 'Voltar', onPress: () => navigation.goBack()}
          ]
        );
      } else {
        Alert.alert(
          'VISA Tokenização Falhou ❌',
          `${result.message}\n\nCódigo: ${result.errorCode}`,
          [
            {text: 'Tentar Novamente'},
            {text: 'Voltar', onPress: () => navigation.goBack()}
          ]
        );
      }

    } catch (error) {
      setIsLoading(false);
      setCurrentStep('');
      Alert.alert('Erro', 'Falha na comunicação com o serviço de tokenização');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header VISA */}
          <View style={styles.header}>
            <Text style={styles.title}>VISA Device Tokenization</Text>
            <Text style={styles.subtitle}>POC - Certificação VISA Brasil via Celcoin</Text>
          </View>

          {/* Device Status */}
          {/*
          <View style={styles.deviceStatus}>
            <Text style={styles.sectionTitle}>Status do Dispositivo</Text>
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>📱</Text>
                <Text style={styles.statusLabel}>NFC</Text>
                <Text style={styles.statusValue}>✅ Ativo</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>🔒</Text>
                <Text style={styles.statusLabel}>HCE</Text>
                <Text style={styles.statusValue}>✅ Suportado</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusIcon}>🛡️</Text>
                <Text style={styles.statusLabel}>Segurança</Text>
                <Text style={styles.statusValue}>✅ Conforme</Text>
              </View>
            </View>
          </View>
          */}

          {/* Form */}
          <View style={styles.form}>
            <Text style={styles.sectionTitle}>Dados do Cartão VISA</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número do Cartão VISA</Text>
              <TextInput
                style={styles.input}
                value={formData.cardNumber}
                onChangeText={value => handleInputChange('cardNumber', value)}
                placeholder="4*** **** **** ****"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={19}
              />
              <Text style={styles.hint}>Apenas cartões VISA nesta POC</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Portador</Text>
              <TextInput
                style={styles.input}
                value={formData.cardholderName}
                onChangeText={value => handleInputChange('cardholderName', value)}
                placeholder="João Silva"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Validade</Text>
                <TextInput
                  style={styles.input}
                  value={formData.expiryDate}
                  onChangeText={value => handleInputChange('expiryDate', value)}
                  placeholder="MM/AA"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={styles.input}
                  value={formData.cvv}
                  onChangeText={value => handleInputChange('cvv', value)}
                  placeholder="123"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>
          </View>

          {/* VISA Requirements */}
          {/*
          <View style={styles.requirements}>
            <Text style={styles.sectionTitle}>Requisitos VISA Brasil</Text>
            <View style={styles.requirementsList}>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>✅</Text>
                <Text style={styles.requirementText}>Device Tokenization (não pagamentos)</Text>
              </View>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>✅</Text>
                <Text style={styles.requirementText}>Suporte NFC + QR Code</Text>
              </View>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>✅</Text>
                <Text style={styles.requirementText}>Integração Celcoin/Pismo</Text>
              </View>
              <View style={styles.requirement}>
                <Text style={styles.requirementIcon}>✅</Text>
                <Text style={styles.requirementText}>Taxa sucesso 90%+</Text>
              </View>
            </View>
          </View>
          */}

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1434a4" />
              <Text style={styles.loadingText}>{currentStep}</Text>
              <Text style={styles.loadingSubtext}>Processando via Celcoin...</Text>
            </View>
          )}

        </ScrollView>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.tokenizeButton, isLoading && styles.buttonDisabled]}
            onPress={handleTokenizeCard}
            disabled={isLoading}
            activeOpacity={0.8}>
            <Text style={styles.tokenizeButtonText}>
              {isLoading ? 'Processando...' : '🏦 Tokenizar com VISA'}
            </Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
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
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    alignItems: 'center',
    marginBottom: 20
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
  visaBadge: {
    backgroundColor: '#1434a4',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  visaBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  deviceStatus: {
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
  statusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusItem: {
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  statusLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#16a34a',
  },
  form: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  hint: {
    fontSize: 12,
    color: '#1434a4',
    marginTop: 4,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  requirements: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  requirementsList: {
    gap: 12,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  requirementIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  requirementText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  loadingContainer: {
    margin: 20,
    marginTop: 0,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  tokenizeButton: {
    backgroundColor: '#1434a4',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#1434a4',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  tokenizeButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default VISATokenizationScreen;

// src/screens/VISAResultScreen.tsx
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {CelcoinTokenizationService, VISATokenizationResult, VISAComplianceMetrics} from '../services/CelcoinTokenizationService';

type RootStackParamList = {
  Home: undefined;
  VISATokenization: undefined;
  VISAResult: {result: VISATokenizationResult};
};

type VISAResultScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VISAResult'>;
type VISAResultScreenRouteProp = RouteProp<RootStackParamList, 'VISAResult'>;

interface Props {
  navigation: VISAResultScreenNavigationProp;
  route: VISAResultScreenRouteProp;
}

const VISAResultScreen: React.FC<Props> = ({route, navigation}) => {
  const {result} = route.params;
  const [complianceMetrics, setComplianceMetrics] = useState<VISAComplianceMetrics | null>(null);

  useEffect(() => {
    // Carregar métricas de compliance VISA
    const metrics = CelcoinTokenizationService.getVISAComplianceMetrics();
    setComplianceMetrics(metrics);
  }, []);

  const getStatusColor = (success: boolean): string => {
    return success ? '#16a34a' : '#dc2626';
  };

  const getStatusIcon = (success: boolean): string => {
    return success ? '✅' : '❌';
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Resultado da Tokenização</Text>
          <Text style={styles.subtitle}>VISA Device Tokenization via Celcoin</Text>
          <View style={[styles.statusBadge, {backgroundColor: getStatusColor(result.success)}]}>
            <Text style={styles.statusBadgeText}>
              {getStatusIcon(result.success)} {result.success ? 'SUCESSO' : 'FALHA'}
            </Text>
          </View>
        </View>

        {/* Resultado Principal */}
        <View style={styles.resultCard}>
          <Text style={styles.sectionTitle}>Detalhes do Token</Text>
          
          {result.success ? (
            <>
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Token ID:</Text>
                <Text style={styles.resultValue}>{result.tokenId}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Device Token:</Text>
                <Text style={styles.resultValue}>{result.deviceTokenId}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>PAN Mascarado:</Text>
                <Text style={styles.resultValue}>{result.maskedPan}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Rede:</Text>
                <Text style={styles.resultValue}>{result.tokenNetwork}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Validade:</Text>
                <Text style={styles.resultValue}>{result.expiryDate}</Text>
              </View>
              
              <View style={styles.resultRow}>
                <Text style={styles.resultLabel}>Tempo de Processamento:</Text>
                <Text style={styles.resultValue}>{result.processingTime}ms</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>❌ Tokenização Falhou</Text>
                <Text style={styles.errorCode}>Código: {result.errorCode}</Text>
                <Text style={styles.errorMessage}>{result.message}</Text>
                {result.processingTime && (
                  <Text style={styles.errorTime}>Tempo: {result.processingTime}ms</Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* Compliance VISA */}
        <View style={styles.complianceCard}>
          <Text style={styles.sectionTitle}>VISA Compliance Data</Text>
          
          <View style={styles.complianceGrid}>
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>Tentativa</Text>
              <Text style={[styles.complianceValue, {color: result.complianceData.tokenizationAttempt ? '#16a34a' : '#dc2626'}]}>
                {getStatusIcon(result.complianceData.tokenizationAttempt)}
              </Text>
            </View>
            
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>Device Elegível</Text>
              <Text style={[styles.complianceValue, {color: result.complianceData.deviceEligible ? '#16a34a' : '#dc2626'}]}>
                {getStatusIcon(result.complianceData.deviceEligible)}
              </Text>
            </View>
            
            <View style={styles.complianceItem}>
              <Text style={styles.complianceLabel}>VISA Compliant</Text>
              <Text style={[styles.complianceValue, {color: result.complianceData.visaCompliant ? '#16a34a' : '#dc2626'}]}>
                {getStatusIcon(result.complianceData.visaCompliant)}
              </Text>
            </View>
            
            {result.complianceData.successfulTokenization !== undefined && (
              <View style={styles.complianceItem}>
                <Text style={styles.complianceLabel}>Tokenização</Text>
                <Text style={[styles.complianceValue, {color: result.complianceData.successfulTokenization ? '#16a34a' : '#dc2626'}]}>
                  {getStatusIcon(result.complianceData.successfulTokenization)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Métricas Gerais VISA */}
        {complianceMetrics && (
          <View style={styles.metricsCard}>
            <Text style={styles.sectionTitle}>Métricas VISA Brasil</Text>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Taxa de Sucesso Tokenização:</Text>
              <Text style={[
                styles.metricValue,
                {color: complianceMetrics.tokenizationSuccessRate >= 90 ? '#16a34a' : '#dc2626'}
              ]}>
                {complianceMetrics.tokenizationSuccessRate.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Taxa Elegibilidade Device:</Text>
              <Text style={[
                styles.metricValue,
                {color: complianceMetrics.deviceEligibilityRate >= 85 ? '#16a34a' : '#dc2626'}
              ]}>
                {complianceMetrics.deviceEligibilityRate.toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Tempo Médio Processamento:</Text>
              <Text style={styles.metricValue}>
                {complianceMetrics.averageProcessingTime}ms
              </Text>
            </View>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Total de Tokenizações:</Text>
              <Text style={styles.metricValue}>
                {complianceMetrics.totalTokenizations.toLocaleString()}
              </Text>
            </View>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>Ambiente:</Text>
              <Text style={styles.metricValue}>
                {complianceMetrics.environment}
              </Text>
            </View>
            
            <View style={styles.metricRow}>
              <Text style={styles.metricLabel}>VISA Brasil Compliant:</Text>
              <Text style={[
                styles.metricValue,
                {color: complianceMetrics.visaBrazilCompliant ? '#16a34a' : '#dc2626'}
              ]}>
                {getStatusIcon(complianceMetrics.visaBrazilCompliant)}
              </Text>
            </View>
          </View>
        )}

        {/* Redes e Métodos Suportados */}
        {complianceMetrics && (
          <View style={styles.supportCard}>
            <Text style={styles.sectionTitle}>Suporte VISA Brasil</Text>
            
            <View style={styles.supportSection}>
              <Text style={styles.supportLabel}>Redes Certificadas:</Text>
              <View style={styles.tagsContainer}>
                {complianceMetrics.supportedNetworks.map((network, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{network}</Text>
                  </View>
                ))}
              </View>
            </View>
            
            <View style={styles.supportSection}>
              <Text style={styles.supportLabel}>Métodos de Pagamento:</Text>
              <View style={styles.tagsContainer}>
                {complianceMetrics.supportedMethods.map((method, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{method}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Informações Técnicas */}
        <View style={styles.technicalCard}>
          <Text style={styles.sectionTitle}>Informações Técnicas</Text>
          
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Tipo de Tokenização:</Text>
            <Text style={styles.techValue}>Device Tokenization</Text>
          </View>
          
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Provider:</Text>
            <Text style={styles.techValue}>Celcoin/Pismo</Text>
          </View>
          
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Padrão VISA:</Text>
            <Text style={styles.techValue}>VTS (VISA Token Service)</Text>
          </View>
          
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Segurança:</Text>
            <Text style={styles.techValue}>EMV Token Spec v2.0</Text>
          </View>
          
          <View style={styles.techRow}>
            <Text style={styles.techLabel}>Timestamp:</Text>
            <Text style={styles.techValue}>{new Date().toLocaleString('pt-BR')}</Text>
          </View>
        </View>

      </ScrollView>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => navigation.navigate('VISATokenization')}
          activeOpacity={0.8}>
          <Text style={styles.secondaryButtonText}>🔄 Nova Tokenização</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}>
          <Text style={styles.primaryButtonText}>🏠 Voltar ao Início</Text>
        </TouchableOpacity>
      </View>

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
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusBadgeText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultCard: {
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
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  resultLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  resultValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    flex: 2,
    textAlign: 'right',
    fontFamily: 'monospace',
  },
  errorCard: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
    marginBottom: 8,
  },
  errorCode: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  errorMessage: {
    fontSize: 14,
    color: '#991b1b',
    marginBottom: 8,
  },
  errorTime: {
    fontSize: 12,
    color: '#7f1d1d',
    fontStyle: 'italic',
  },
  complianceCard: {
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
  complianceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  complianceItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  complianceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  complianceValue: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  metricsCard: {
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
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  supportCard: {
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
  supportSection: {
    marginBottom: 16,
  },
  supportLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1434a4',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  tagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  technicalCard: {
    margin: 20,
    marginTop: 0,
    marginBottom: 100, // Espaço para botões
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  techRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  techLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 1,
  },
  techValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
    flex: 1,
    textAlign: 'right',
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
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#1434a4',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default VISAResultScreen;

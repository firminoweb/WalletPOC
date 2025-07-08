// src/config/VISAConfig.ts

export interface VISAEnvironmentConfig {
  environment: 'TEST' | 'PRODUCTION';
  merchantId: string;
  gatewayMerchantId: string;
  apiEndpoint: string;
  supportedNetworks: string[];
  requiredDeviceFeatures: string[];
  complianceThresholds: {
    tokenizationSuccessRate: number;
    deviceEligibilityRate: number;
  };
}

/**
 * Configurações para ambiente de TESTE VISA
 */
export const VISA_TEST_CONFIG: VISAEnvironmentConfig = {
  environment: 'TEST',
  merchantId: 'VISA_TEST_MERCHANT_BR_001',
  gatewayMerchantId: 'GATEWAY_TEST_12345',
  apiEndpoint: 'https://sandbox.visa.com/vts',
  supportedNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
  requiredDeviceFeatures: ['NFC', 'HCE'],
  complianceThresholds: {
    tokenizationSuccessRate: 90.0, // VISA exige 90%+
    deviceEligibilityRate: 85.0
  }
};

/**
 * Configurações para ambiente de PRODUÇÃO VISA
 * ⚠️ ATENÇÃO: Substituir pelos valores reais em produção
 */
export const VISA_PRODUCTION_CONFIG: VISAEnvironmentConfig = {
  environment: 'PRODUCTION',
  merchantId: 'VISA_PROD_MERCHANT_BR_XXXX', // ⚠️ Substituir
  gatewayMerchantId: 'GATEWAY_PROD_XXXXX',   // ⚠️ Substituir
  apiEndpoint: 'https://api.visa.com/vts',
  supportedNetworks: ['VISA', 'MASTERCARD', 'AMEX'],
  requiredDeviceFeatures: ['NFC', 'HCE'],
  complianceThresholds: {
    tokenizationSuccessRate: 90.0,
    deviceEligibilityRate: 85.0
  }
};

/**
 * Requisitos específicos VISA Brasil
 */
export const VISA_BRAZIL_REQUIREMENTS = {
  // Métodos de pagamento obrigatórios
  paymentMethods: ['NFC', 'QR_CODE', 'E_COMMERCE'],
  
  // Redes certificadas obrigatórias
  certifiedNetworks: ['CIELO', 'REDE', 'GETNET'],
  
  // ID&V obrigatório para Manual Provisioning
  identityVerificationMethods: ['SMS_OTP', 'EMAIL_OTP', 'APP_TO_APP'],
  
  // Taxa mínima de sucesso
  minimumSuccessRate: 90.0,
  
  // Funcionalidades obrigatórias
  mandatoryFeatures: [
    'PUSH_PROVISIONING',    // Obrigatório
    'MANUAL_PROVISIONING',  // Obrigatório
    'NFC_SUPPORT',          // Obrigatório
    'QR_CODE_SUPPORT'       // Obrigatório
  ]
};

/**
 * Configurações de debug para desenvolvimento
 */
export const DEBUG_CONFIG = {
  enableDetailedLogging: true,
  logTokenizationAttempts: true,
  logDeviceEligibilityChecks: true,
  logComplianceMetrics: true,
  simulateNetworkDelays: true,
  mockSuccessRates: {
    tokenization: 94.2,
    deviceEligibility: 96.8
  }
};

/**
 * Mensagens de erro padronizadas VISA
 */
export const VISA_ERROR_MESSAGES = {
  DEVICE_NOT_ELIGIBLE: 'Dispositivo não atende aos requisitos VISA para tokenização',
  CARD_NOT_SUPPORTED: 'Cartão não suportado para tokenização VISA',
  NETWORK_NOT_SUPPORTED: 'Rede do cartão não suportada',
  TOKENIZATION_FAILED: 'Falha no processo de tokenização',
  INVALID_CARD_DATA: 'Dados do cartão inválidos ou incompletos',
  TOKEN_ALREADY_EXISTS: 'Token já existe para este cartão neste dispositivo',
  TOKEN_REVOKED: 'Token foi revogado e não pode ser usado',
  COMPLIANCE_THRESHOLD_NOT_MET: 'Taxa de sucesso abaixo do mínimo exigido pela VISA',
  NFC_NOT_AVAILABLE: 'NFC não disponível - obrigatório para tokenização VISA',
  HCE_NOT_SUPPORTED: 'Host Card Emulation não suportado'
};

/**
 * Códigos de status VISA Token Service
 */
export const VISA_TOKEN_STATUS = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  DELETED: 'DELETED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION'
} as const;

/**
 * Configuração para diferentes tipos de cartão
 */
export const CARD_TYPE_CONFIG = {
  VISA: {
    network: 'VISA',
    binRanges: ['4'],
    maxLength: 19,
    cvvLength: 3,
    tokenizationSupported: true
  },
  MASTERCARD: {
    network: 'MASTERCARD',
    binRanges: ['5', '2'],
    maxLength: 16,
    cvvLength: 3,
    tokenizationSupported: true
  },
  AMEX: {
    network: 'AMEX',
    binRanges: ['34', '37'],
    maxLength: 15,
    cvvLength: 4,
    tokenizationSupported: true
  }
};

/**
 * Helper para obter configuração baseada no ambiente
 */
export function getVISAConfig(environment: 'TEST' | 'PRODUCTION'): VISAEnvironmentConfig {
  switch (environment) {
    case 'TEST':
      return VISA_TEST_CONFIG;
    case 'PRODUCTION':
      return VISA_PRODUCTION_CONFIG;
    default:
      throw new Error(`Ambiente VISA inválido: ${environment}`);
  }
}

/**
 * Helper para verificar compliance com requisitos VISA Brasil
 */
export function checkVISABrazilCompliance(metrics: {
  tokenizationSuccessRate: number;
  deviceEligibilityRate: number;
  supportedMethods: string[];
  certifiedNetworks: string[];
}): {
  compliant: boolean;
  issues: string[];
} {
  const issues: string[] = [];

  // Verificar taxa de sucesso mínima
  if (metrics.tokenizationSuccessRate < VISA_BRAZIL_REQUIREMENTS.minimumSuccessRate) {
    issues.push(`Taxa de sucesso tokenização (${metrics.tokenizationSuccessRate}%) abaixo do mínimo (${VISA_BRAZIL_REQUIREMENTS.minimumSuccessRate}%)`);
  }

  // Verificar métodos de pagamento obrigatórios
  for (const method of VISA_BRAZIL_REQUIREMENTS.paymentMethods) {
    if (!metrics.supportedMethods.includes(method)) {
      issues.push(`Método de pagamento obrigatório não suportado: ${method}`);
    }
  }

  // Verificar redes certificadas obrigatórias
  for (const network of VISA_BRAZIL_REQUIREMENTS.certifiedNetworks) {
    if (!metrics.certifiedNetworks.includes(network)) {
      issues.push(`Rede certificada obrigatória não suportada: ${network}`);
    }
  }

  return {
    compliant: issues.length === 0,
    issues
  };
}

/**
 * Helper para log de auditoria VISA
 */
export function createVISAAuditLog(event: {
  type: 'TOKENIZATION' | 'VERIFICATION' | 'REVOCATION';
  cardLastFour: string;
  tokenId?: string;
  success: boolean;
  errorCode?: string;
  deviceId: string;
  timestamp: Date;
}): string {
  const logEntry = {
    timestamp: event.timestamp.toISOString(),
    event_type: event.type,
    card_reference: `****${event.cardLastFour}`,
    token_id: event.tokenId || 'N/A',
    success: event.success,
    error_code: event.errorCode || 'N/A',
    device_id: event.deviceId,
    compliance_environment: 'VISA_BRAZIL'
  };

  return JSON.stringify(logEntry);
}

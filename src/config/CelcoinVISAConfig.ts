// src/config/CelcoinVISAConfig.ts
// Configuração específica para VISA Device Tokenization via Celcoin/Pismo

export interface CelcoinVISAConfig {
  environment: 'SANDBOX' | 'PRODUCTION';
  baseUrl: string;
  apiKey: string;
  visaComplianceVersion: string;
  brazilComplianceRequired: boolean;
  deviceTokenizationEnabled: boolean;
  paymentTokenizationEnabled: boolean; // false para esta POC
}

/**
 * VISA Device Tokenization - Ambiente SANDBOX (Celcoin)
 */
export const CELCOIN_VISA_SANDBOX: CelcoinVISAConfig = {
  environment: 'SANDBOX',
  baseUrl: 'https://sandbox-apicorp.celcoin.com.br/cards/v1',
  apiKey: process.env.CELCOIN_SANDBOX_API_KEY || 'REPLACE_WITH_REAL_KEY',
  visaComplianceVersion: 'VISA_BRAZIL_2024',
  brazilComplianceRequired: true,
  deviceTokenizationEnabled: true,
  paymentTokenizationEnabled: false // POC foca apenas em Device Tokenization
};

/**
 * VISA Device Tokenization - Ambiente PRODUÇÃO (Celcoin)
 * ⚠️ ATENÇÃO: Substituir pelos valores reais em produção
 */
export const CELCOIN_VISA_PRODUCTION: CelcoinVISAConfig = {
  environment: 'PRODUCTION',
  baseUrl: 'https://apicorp.celcoin.com.br/cards/v1',
  apiKey: process.env.CELCOIN_PRODUCTION_API_KEY || 'REPLACE_WITH_REAL_PRODUCTION_KEY',
  visaComplianceVersion: 'VISA_BRAZIL_2024',
  brazilComplianceRequired: true,
  deviceTokenizationEnabled: true,
  paymentTokenizationEnabled: false
};

/**
 * Requisitos VISA Brasil para Device Tokenization
 */
export const VISA_BRAZIL_DEVICE_REQUIREMENTS = {
  // Device Requirements (obrigatórios)
  deviceRequirements: {
    nfcRequired: true,
    hceRequired: true, // Host Card Emulation
    lockScreenRequired: true,
    minimumAndroidVersion: '6.0',
    biometricsPreferred: true, // Preferível mas não obrigatório
  },
  
  // Métodos de pagamento obrigatórios para VISA Brasil
  paymentMethods: {
    nfc: {
      required: true,
      supportedNetworks: ['CIELO', 'REDE', 'GETNET']
    },
    qrCode: {
      required: true,
      supportedNetworks: ['CIELO', 'REDE', 'GETNET']
    },
    ecommerce: {
      required: true,
      supportedNetworks: ['CIELO', 'REDE', 'GETNET']
    }
  },
  
  // Thresholds de compliance VISA
  complianceThresholds: {
    tokenizationSuccessRate: 90.0, // VISA exige 90%+
    deviceEligibilityRate: 85.0,
    maxProcessingTime: 5000, // 5 segundos máximo
    uptimeRequired: 99.5 // 99.5% uptime
  },
  
  // Tipos de tokenização suportados
  tokenizationTypes: {
    deviceTokenization: true,  // ✅ Foco desta POC
    paymentTokenization: false, // ❌ Não é o foco
    pushProvisioning: true,    // ✅ Obrigatório VISA Brasil
    manualProvisioning: true   // ✅ Obrigatório VISA Brasil
  }
};

/**
 * Endpoints Celcoin mapeados para funcionalidades VISA
 */
export const CELCOIN_VISA_ENDPOINTS = {
  // Device Tokenization
  createVirtualCard: '/accounts/{account}/customers/{customer}/card',
  getCardTokens: '/accounts/{account}/customers/{customer}/card/{card}/token',
  manageToken: '/accounts/{account}/customers/{customer}/card/{card}/network-tokens/{token}',
  
  // Card Management
  cardInfo: '/accounts/{account}/customers/{customer}/card/{card}/info',
  cardPassword: '/accounts/{account}/customers/{customer}/card/{card}/password',
  updateCard: '/accounts/{account}/customers/{customer}/card/{card}',
  
  // Status Management
  activateCard: '/accounts/{account}/customers/{customer}/card/{card}/activate',
  blockCard: '/accounts/{account}/customers/{customer}/card/{card}/block',
  unblockCard: '/accounts/{account}/customers/{customer}/card/{card}/unblock'
};

/**
 * Configurações de segurança VISA
 */
export const VISA_SECURITY_CONFIG = {
  encryption: {
    algorithm: 'AES-256-GCM',
    keyRotationInterval: 24 * 60 * 60 * 1000, // 24 horas
    tokenLength: 16,
    deviceBindingRequired: true
  },
  
  deviceFingerprinting: {
    includeDeviceModel: true,
    includeOSVersion: true,
    includeAppVersion: true,
    includeNetworkInfo: false, // Privacy
    includeLocationInfo: false // Privacy
  },
  
  logging: {
    auditAllTransactions: true,
    retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 dias para POC
    piiLoggingEnabled: false, // Nunca logar PII
    complianceLoggingEnabled: true
  }
};

/**
 * Mensagens de erro padronizadas para VISA Brasil
 */
export const VISA_BRAZIL_ERROR_MESSAGES = {
  // Device Eligibility
  DEVICE_NOT_ELIGIBLE: 'Dispositivo não atende aos requisitos VISA para tokenização',
  NFC_NOT_AVAILABLE: 'NFC não disponível - obrigatório para VISA Brasil',
  HCE_NOT_SUPPORTED: 'Host Card Emulation não suportado',
  LOCK_SCREEN_NOT_SET: 'Tela de bloqueio não configurada',
  
  // Card Validation
  CARD_NOT_VISA: 'Apenas cartões VISA são suportados nesta POC',
  CARD_EXPIRED: 'Cartão expirado',
  INVALID_CVV: 'CVV inválido para cartão VISA',
  INVALID_CARDHOLDER_NAME: 'Nome do portador inválido',
  
  // Tokenization
  TOKENIZATION_FAILED: 'Falha no processo de tokenização VISA',
  TOKEN_ALREADY_EXISTS: 'Token já existe para este cartão',
  TOKEN_CREATION_FAILED: 'Não foi possível criar o device token',
  
  // Celcoin Integration
  CELCOIN_API_ERROR: 'Erro na comunicação com Celcoin/Pismo',
  CELCOIN_AUTHENTICATION_FAILED: 'Falha na autenticação com Celcoin',
  CELCOIN_RATE_LIMIT: 'Limite de requisições Celcoin excedido',
  
  // Compliance
  COMPLIANCE_THRESHOLD_NOT_MET: 'Taxa de sucesso abaixo do mínimo VISA (90%)',
  VISA_BRAZIL_NON_COMPLIANT: 'Implementação não conforme com VISA Brasil'
};

/**
 * Códigos de resposta Celcoin mapeados para VISA
 */
export const CELCOIN_RESPONSE_MAPPING = {
  200: 'SUCCESS',
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  404: 'CARD_NOT_FOUND',
  422: 'VALIDATION_ERROR',
  429: 'RATE_LIMIT_EXCEEDED',
  500: 'INTERNAL_ERROR',
  
  // Códigos específicos Celcoin
  'CRDU404': 'CARD_NOT_FOUND',
  'CRDU422': 'CARD_STATUS_INVALID',
  'CRDU969': 'CARD_OPERATION_FAILED',
  'CRDU970': 'EMBOSSING_NOT_STARTED',
  'CRDU971': 'TRACKING_ERROR',
  'CRD999': 'GENERAL_ERROR'
};

/**
 * Helper para obter configuração baseada no ambiente
 */
export function getCelcoinVISAConfig(environment: 'SANDBOX' | 'PRODUCTION'): CelcoinVISAConfig {
  switch (environment) {
    case 'SANDBOX':
      return CELCOIN_VISA_SANDBOX;
    case 'PRODUCTION':
      return CELCOIN_VISA_PRODUCTION;
    default:
      throw new Error(`Ambiente Celcoin VISA inválido: ${environment}`);
  }
}

/**
 * Helper para verificar compliance VISA Brasil com Celcoin
 */
export function checkVISABrazilCompliance(metrics: {
  tokenizationSuccessRate: number;
  deviceEligibilityRate: number;
  averageProcessingTime: number;
  celcoinIntegrationHealth: boolean;
}): {
  compliant: boolean;
  issues: string[];
  recommendations: string[];
} {
  const issues: string[] = [];
  const recommendations: string[] = [];

  // Verificar taxa de sucesso tokenização
  if (metrics.tokenizationSuccessRate < VISA_BRAZIL_DEVICE_REQUIREMENTS.complianceThresholds.tokenizationSuccessRate) {
    issues.push(`Taxa de sucesso tokenização (${metrics.tokenizationSuccessRate}%) abaixo do mínimo VISA (${VISA_BRAZIL_DEVICE_REQUIREMENTS.complianceThresholds.tokenizationSuccessRate}%)`);
    recommendations.push('Melhorar validação de entrada e tratamento de erros');
  }

  // Verificar elegibilidade de device
  if (metrics.deviceEligibilityRate < VISA_BRAZIL_DEVICE_REQUIREMENTS.complianceThresholds.deviceEligibilityRate) {
    issues.push(`Taxa de elegibilidade do device (${metrics.deviceEligibilityRate}%) abaixo do recomendado (${VISA_BRAZIL_DEVICE_REQUIREMENTS.complianceThresholds.deviceEligibilityRate}%)`);
    recommendations.push('Revisar critérios de elegibilidade do dispositivo');
  }

  // Verificar tempo de processamento
  if (metrics.averageProcessingTime > VISA_BRAZIL_DEVICE_REQUIREMENTS.complianceThresholds.maxProcessingTime) {
    issues.push(`Tempo médio de processamento (${metrics.averageProcessingTime}ms) acima do máximo (${VISA_BRAZIL_DEVICE_REQUIREMENTS.complianceThresholds.maxProcessingTime}ms)`);
    recommendations.push('Otimizar chamadas para API Celcoin/Pismo');
  }

  // Verificar saúde da integração Celcoin
  if (!metrics.celcoinIntegrationHealth) {
    issues.push('Problemas na integração com Celcoin/Pismo');
    recommendations.push('Verificar conectividade e credenciais Celcoin');
  }

  return {
    compliant: issues.length === 0,
    issues,
    recommendations
  };
}

/**
 * Helper para gerar headers HTTP para Celcoin
 */
export function generateCelcoinHeaders(apiKey: string): Record<string, string> {
  return {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'VISA-Device-Tokenization-POC/1.0.0',
    'X-VISA-Compliance': 'BRAZIL_2024',
    'X-Integration-Type': 'DEVICE_TOKENIZATION'
  };
}

/**
 * Helper para validar se device atende requisitos VISA Brasil
 */
export function validateDeviceForVISA(): {
  eligible: boolean;
  requirements: Array<{
    requirement: string;
    met: boolean;
    description: string;
  }>;
} {
  const requirements = [
    {
      requirement: 'NFC',
      met: true, // Simular - em produção verificar real
      description: 'Near Field Communication disponível'
    },
    {
      requirement: 'HCE',
      met: true, // Simular - em produção verificar real
      description: 'Host Card Emulation suportado'
    },
    {
      requirement: 'LOCK_SCREEN',
      met: true, // Simular - em produção verificar real
      description: 'Tela de bloqueio configurada'
    },
    {
      requirement: 'ANDROID_VERSION',
      met: true, // Simular - em produção verificar real
      description: 'Android 6.0+ necessário'
    }
  ];

  const eligible = requirements.every(req => req.met);

  return {
    eligible,
    requirements
  };
}

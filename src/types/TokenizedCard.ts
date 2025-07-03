// src/types/TokenizedCard.ts
export interface TokenizedCard {
  id: string;
  // PAN mascarado (nunca armazenar o número real)
  maskedPan: string;
  // Token que substitui o PAN real
  paymentToken: string;
  // Dados do portador
  holder: string;
  expiry: string;
  // Dados de tokenização
  tokenProvider: 'GOOGLE_PAY' | 'APPLE_PAY' | 'SAMSUNG_PAY';
  tokenStatus: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  brand: CardBrand;
  issuerBin: string; // 6 primeiros dígitos
  lastFour: string; // 4 últimos dígitos
  // Informações de risco e verificação
  riskScore: number; // 0-100
  authenticationPath: 'GREEN' | 'YELLOW' | 'RED';
  verificationMethod?: 'SMS_OTP' | 'EMAIL_OTP' | 'APP_TO_APP' | 'CALL_CENTER';
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  // Metadados
  color: string;
  createdAt: Date;
  lastUsed?: Date;
  deviceInfo: DeviceInfo;
  transactionCount: number;
  // Certificações
  supportedMethods: PaymentMethod[];
}

export interface DeviceInfo {
  deviceId: string;
  deviceName: string;
  osVersion: string;
  appVersion: string;
  hasNfc: boolean;
  hasBiometrics: boolean;
  riskScore: number;
}

export interface PaymentMethod {
  type: 'NFC' | 'QR_CODE' | 'E_COMMERCE';
  enabled: boolean;
  supportedNetworks: string[]; // ['CIELO', 'REDE', 'GETNET']
}

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'elo' | 'discover' | 'unknown';

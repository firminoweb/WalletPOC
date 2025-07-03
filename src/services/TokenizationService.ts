// src/services/TokenizationService.ts
import {LoggingService} from './LoggingService';
import {EncryptionService} from './EncryptionService';
import {CardBrand} from '../types/TokenizedCard';

export class TokenizationService {
  
  // Simula avaliação de risco baseada nos critérios do Google Pay
  static evaluateRisk(cardData: any, deviceInfo: any): {
    riskScore: number;
    authenticationPath: 'GREEN' | 'YELLOW' | 'RED';
    reason: string;
  } {
    const startTime = Date.now();
    console.log(`🛡️ [RISK] Iniciando avaliação de risco...`);
    
    let riskScore = 0;
    
    // Fatores de risco do dispositivo (0-30 pontos)
    const deviceRisk = this.calculateDeviceRisk(deviceInfo);
    riskScore += deviceRisk;
    
    // Fatores de risco da conta/histórico (0-30 pontos)
    const accountRisk = this.calculateAccountRisk(cardData);
    riskScore += accountRisk;
    
    // Fatores de geolocalização (0-20 pontos)
    const geolocationRisk = this.calculateGeolocationRisk();
    riskScore += geolocationRisk;
    
    // Fatores do cartão (0-20 pontos)
    const cardRisk = this.calculateCardRisk(cardData);
    riskScore += cardRisk;
    
    // Determina caminho de autenticação baseado no score
    let authenticationPath: 'GREEN' | 'YELLOW' | 'RED';
    let reason: string;
    
    if (riskScore >= 70) {
      authenticationPath = 'GREEN';
      reason = `Alto score de confiança (${riskScore}/100) - aprovação automática`;
    } else if (riskScore >= 40) {
      authenticationPath = 'YELLOW';
      reason = `Score moderado (${riskScore}/100) - verificação adicional necessária`;
    } else {
      authenticationPath = 'RED';
      reason = `Score baixo (${riskScore}/100) - tokenização negada por segurança`;
    }

    const processingTime = Date.now() - startTime;
    
    // ✅ LOG VISA: Avaliação de risco
    LoggingService.logRiskAssessment({
      riskScore,
      authenticationPath,
      deviceRisk,
      accountRisk,
      geolocationRisk,
      reason
    });

    console.log(`🛡️ [RISK] Avaliação concluída em ${processingTime}ms: ${authenticationPath} (${riskScore}/100)`);

    return {
      riskScore,
      authenticationPath,
      reason
    };
  }
  
  // Simula geração de token (em produção seria feito pelo TSP)
  static generatePaymentToken(pan: string): string {
    console.log(`🪙 [TOKEN] Gerando token de pagamento...`);
    
    // Usar o serviço de encryption para gerar token seguro
    const token = EncryptionService.generatePaymentToken(pan);
    
    // Simular registro no TSP (Token Service Provider)
    this.registerTokenWithTSP(token);
    
    console.log(`✅ [TOKEN] Token gerado com sucesso: ${token.tokenValue}`);
    return token.tokenValue;
  }
  
  // Simula validação Luhn + BIN check + issuer verification
  static validateForTokenization(cardData: any): {
    isValid: boolean;
    errors: string[];
    issuerResponse?: 'APPROVED' | 'DECLINED' | 'REQUIRES_VERIFICATION';
    encryptedPAN?: any;
    maskedPAN?: string;
  } {
    const startTime = Date.now();
    console.log(`🔍 [VALIDATION] Iniciando validação para tokenização...`);
    
    const errors: string[] = [];
    
    // ✅ ENCRYPT: Criptografar PAN antes de qualquer processamento
    let encryptedPAN;
    let maskedPAN;
    
    try {
      encryptedPAN = EncryptionService.encryptSensitiveData(cardData.number);
      maskedPAN = EncryptionService.maskPAN(cardData.number);
      console.log(`🔐 [SECURITY] PAN criptografado com chave: ${encryptedPAN.keyId}`);
    } catch (error) {
      console.error(`❌ [SECURITY] Falha na criptografia:`, error);
      errors.push('Erro de segurança no processamento');
    }
    
    // Validação Luhn (algoritmo de cartão de crédito)
    if (!this.luhnCheck(cardData.number)) {
      errors.push('Número do cartão inválido (falha no algoritmo de Luhn)');
    }
    
    // Validação BIN (Bank Identification Number)
    const binValidation = this.validateBIN(cardData.number);
    if (!binValidation.isValid) {
      errors.push(binValidation.error || 'BIN não suportado para tokenização');
    }
    
    // Simula consulta ao emissor
    const issuerValidation = this.validateWithIssuer(cardData);
    
    // Validação de formato
    if (!this.validateCardFormat(cardData)) {
      errors.push('Formato do cartão inválido');
    }
    
    const processingTime = Date.now() - startTime;
    const isValid = errors.length === 0;
    
    // ✅ LOG VISA: Request de tokenização
    LoggingService.logTokenizationRequest({
      deviceId: 'DEVICE_' + Math.random().toString(36).substr(2, 9),
      riskScore: 0, // Será calculado depois na avaliação de risco
      authPath: 'PENDING',
      issuerBin: cardData.number.slice(0, 6),
      cardBrand: this.detectCardBrand(cardData.number),
      deviceFingerprint: EncryptionService.generateDeviceFingerprint()
    });
    
    console.log(`🔍 [VALIDATION] Validação concluída em ${processingTime}ms: ${isValid ? 'APROVADO' : 'REJEITADO'}`);
    
    return {
      isValid,
      errors,
      issuerResponse: issuerValidation.response,
      encryptedPAN,
      maskedPAN
    };
  }

  // Detecta bandeira do cartão
  static detectCardBrand(number: string): CardBrand {
    const cleaned = number.replace(/\s/g, '');
    
    if (/^4/.test(cleaned)) {
      return 'visa';
    }
    if (/^5[1-5]/.test(cleaned) || /^2[2-7]/.test(cleaned)) {
      return 'mastercard';
    }
    if (/^3[47]/.test(cleaned)) {
      return 'amex';
    }
    if (/^6/.test(cleaned)) {
      return 'discover';
    }
    
    return 'unknown';
  }

  // Formatação de número de cartão
  static formatCardNumber(value: string): string {
    const cleaned = value.replace(/\s/g, '');
    const match = cleaned.match(/\d{1,4}/g);
    return match ? match.join(' ') : '';
  }

  // Formatação de data de expiração
  static formatExpiry(value: string): string {
    const cleaned = value.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{0,2})$/);
    
    if (match) {
      return match[2] ? `${match[1]}/${match[2]}` : match[1];
    }
    
    return cleaned;
  }

  // Métodos privados de validação
  private static luhnCheck(cardNumber: string): boolean {
    const cleaned = cardNumber.replace(/\s/g, '');
    let sum = 0;
    let isEven = false;
    
    for (let i = cleaned.length - 1; i >= 0; i--) {
      let digit = parseInt(cleaned[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    const isValid = sum % 10 === 0;
    console.log(`🧮 [LUHN] Validação Luhn: ${isValid ? 'PASSOU' : 'FALHOU'}`);
    return isValid;
  }

  private static validateBIN(cardNumber: string): {isValid: boolean; error?: string} {
    const bin = cardNumber.replace(/\s/g, '').slice(0, 6);
    
    // Lista de BINs suportados (em produção seria uma consulta a base de dados)
    const supportedBins = [
      '453210', // Visa
      '555544', // Mastercard
      '378234', // Amex
      '601100', // Discover
      '506699', // Elo (Brasil)
    ];
    
    const isSupported = supportedBins.some(supportedBin => 
      bin.startsWith(supportedBin.slice(0, 4))
    );
    
    if (!isSupported) {
      console.log(`❌ [BIN] BIN ${bin} não suportado para tokenização`);
      return {
        isValid: false,
        error: 'Bandeira do cartão não suportada para tokenização'
      };
    }
    
    console.log(`✅ [BIN] BIN ${bin} validado com sucesso`);
    return {isValid: true};
  }

  private static validateWithIssuer(cardData: any): {
    response: 'APPROVED' | 'DECLINED' | 'REQUIRES_VERIFICATION'
  } {
    // Simula consulta ao emissor baseada nos dados do cartão
    const brand = this.detectCardBrand(cardData.number);
    const bin = cardData.number.replace(/\s/g, '').slice(0, 6);
    
    // Diferentes emissores têm diferentes políticas
    let approvalRate = 0.7; // 70% base
    
    // Ajusta taxa baseado na bandeira
    if (['visa', 'mastercard'].includes(brand)) {
      approvalRate = 0.85; // Bandeiras principais têm maior aprovação
    }
    
    // BINs específicos podem ter políticas diferentes
    if (bin.startsWith('453210')) { // Visa premium
      approvalRate = 0.90;
    }
    
    // Simula validação do CVV e data
    const hasValidFormat = cardData.cvv && cardData.expiry && cardData.holder;
    if (!hasValidFormat) {
      approvalRate = 0.2; // Baixa aprovação se dados incompletos
    }
    
    const random = Math.random();
    let response: 'APPROVED' | 'DECLINED' | 'REQUIRES_VERIFICATION';
    
    if (random < approvalRate * 0.8) {
      response = 'APPROVED';
    } else if (random < approvalRate) {
      response = 'REQUIRES_VERIFICATION';
    } else {
      response = 'DECLINED';
    }
    
    console.log(`🏦 [ISSUER] Validação do emissor para BIN ${bin} (${brand}): ${response}`);
    return {response};
  }

  private static validateCardFormat(cardData: any): boolean {
    // Validações básicas de formato
    if (!cardData.number || !cardData.holder || !cardData.expiry || !cardData.cvv) {
      return false;
    }
    
    // Validar data de expiração
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      return false;
    }
    
    // Validar CVV
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      return false;
    }
    
    return true;
  }

  // Cálculos de risco específicos
  private static calculateDeviceRisk(deviceInfo: any): number {
    let risk = 0;
    
    if (deviceInfo.hasNfc) risk += 10;
    if (deviceInfo.hasBiometrics) risk += 15;
    if (deviceInfo.riskScore > 80) risk += 15;
    
    console.log(`📱 [DEVICE-RISK] Risco do dispositivo: ${risk}/30`);
    return Math.min(risk, 30);
  }

  private static calculateAccountRisk(cardData: any): number {
    // Simula análise de histórico da conta baseada nos dados do cartão
    const brand = this.detectCardBrand(cardData.number);
    const bin = cardData.number.replace(/\s/g, '').slice(0, 6);
    
    // Análise baseada na bandeira e BIN
    let risk = 15; // Base
    
    if (['visa', 'mastercard'].includes(brand)) {
      risk += 5; // Bandeiras principais são mais confiáveis
    }
    
    // Simula histórico da conta
    const hasGoodHistory = Math.random() > 0.3; // 70% têm bom histórico
    const isFirstTime = Math.random() > 0.7; // 30% primeira vez
    
    if (hasGoodHistory) risk += 10;
    if (!isFirstTime) risk += 5;
    
    console.log(`👤 [ACCOUNT-RISK] Risco da conta para ${brand} (${bin.slice(0,4)}**): ${Math.min(risk, 30)}/30`);
    return Math.min(risk, 30);
  }

  private static calculateGeolocationRisk(): number {
    // Simula análise de geolocalização
    const isBrazil = true; // Assumindo Brasil
    const isKnownLocation = Math.random() > 0.2; // 80% localização conhecida
    
    let risk = 0;
    if (isBrazil) risk += 15;
    if (isKnownLocation) risk += 5;
    
    console.log(`🌍 [GEO-RISK] Risco geográfico: ${risk}/20`);
    return Math.min(risk, 20);
  }

  private static calculateCardRisk(cardData: any): number {
    // Simula análise do cartão
    const brand = this.detectCardBrand(cardData.number);
    const isMainBrand = ['visa', 'mastercard'].includes(brand);
    
    let risk = 5; // Base
    if (isMainBrand) risk += 15;
    
    console.log(`💳 [CARD-RISK] Risco do cartão: ${risk}/20`);
    return Math.min(risk, 20);
  }

  private static registerTokenWithTSP(token: any): void {
    // Simula registro do token no Token Service Provider
    console.log(`📝 [TSP] Registrando token no TSP...`);
    console.log(`📝 [TSP] Token ${token.tokenValue} registrado com sucesso`);
    console.log(`📝 [TSP] Device binding: ${token.deviceBinding.slice(0, 20)}...`);
    console.log(`📝 [TSP] Token Requestor ID: ${token.tokenRequestorId}`);
  }
}
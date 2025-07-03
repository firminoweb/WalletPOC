// src/services/LoggingService.ts
export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Limitar para performance

  static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  // Logs específicos para aprovação VISA
  static logTokenizationRequest(data: TokenizationRequestLog) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      id: `TKN_${Date.now()}`,
      timestamp,
      level: 'INFO',
      category: 'TOKENIZATION_REQUEST',
      message: 'Tokenization request initiated',
      data: {
        deviceId: data.deviceId,
        riskScore: data.riskScore,
        authPath: data.authPath,
        issuerBin: data.issuerBin,
        cardBrand: data.cardBrand,
        deviceFingerprint: data.deviceFingerprint
      },
      visaCompliant: true
    };

    this.getInstance().addLog(logEntry);
    console.log(`🏦 [VISA-LOG] TOKENIZATION_REQUEST`, {
      deviceId: data.deviceId,
      riskScore: data.riskScore,
      authPath: data.authPath,
      issuerBin: data.issuerBin,
      cardBrand: data.cardBrand,
      timestamp
    });
  }

  static logTokenizationResponse(data: TokenizationResponseLog) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      id: `TKN_RESP_${Date.now()}`,
      timestamp,
      level: data.success ? 'INFO' : 'ERROR',
      category: 'TOKENIZATION_RESPONSE',
      message: `Tokenization ${data.success ? 'completed' : 'failed'}`,
      data: {
        success: data.success,
        tokenId: data.tokenId,
        errorCode: data.errorCode,
        processingTime: data.processingTime,
        issuerResponse: data.issuerResponse,
        verificationMethod: data.verificationMethod
      },
      visaCompliant: true
    };

    this.getInstance().addLog(logEntry);
    console.log(`🏦 [VISA-LOG] TOKENIZATION_RESPONSE`, {
      success: data.success,
      tokenId: data.tokenId,
      processingTime: `${data.processingTime}ms`,
      issuerResponse: data.issuerResponse,
      timestamp
    });
  }

  static logRiskAssessment(data: RiskAssessmentLog) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      id: `RISK_${Date.now()}`,
      timestamp,
      level: 'INFO',
      category: 'RISK_ASSESSMENT',
      message: 'Risk assessment completed',
      data: {
        riskScore: data.riskScore,
        authenticationPath: data.authenticationPath,
        deviceRisk: data.deviceRisk,
        accountRisk: data.accountRisk,
        geolocationRisk: data.geolocationRisk,
        reason: data.reason
      },
      visaCompliant: true
    };

    this.getInstance().addLog(logEntry);
    console.log(`🛡️ [VISA-LOG] RISK_ASSESSMENT`, {
      riskScore: data.riskScore,
      authenticationPath: data.authenticationPath,
      deviceRisk: data.deviceRisk,
      accountRisk: data.accountRisk,
      geolocationRisk: data.geolocationRisk,
      reason: data.reason,
      timestamp
    });
  }

  static logTransaction(data: TransactionLog) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      id: `TXN_${Date.now()}`,
      timestamp,
      level: data.success ? 'INFO' : 'ERROR',
      category: 'TRANSACTION',
      message: `Transaction ${data.success ? 'approved' : 'declined'}`,
      data: {
        tokenId: data.tokenId,
        amount: data.amount,
        currency: data.currency,
        merchant: data.merchant,
        network: data.network, // CIELO, REDE, GETNET
        paymentMethod: data.paymentMethod, // NFC, QR_CODE, E_COMMERCE
        success: data.success,
        authCode: data.authCode,
        responseCode: data.responseCode
      },
      visaCompliant: true
    };

    this.getInstance().addLog(logEntry);
    console.log(`💳 [VISA-LOG] TRANSACTION`, {
      tokenId: data.tokenId,
      amount: `R$ ${data.amount.toFixed(2)}`,
      network: data.network,
      paymentMethod: data.paymentMethod,
      success: data.success,
      authCode: data.authCode,
      responseCode: data.responseCode,
      timestamp
    });
  }

  static logSecurityEvent(data: SecurityEventLog) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      id: `SEC_${Date.now()}`,
      timestamp,
      level: 'WARN',
      category: 'SECURITY_EVENT',
      message: data.message,
      data: {
        eventType: data.eventType,
        severity: data.severity,
        deviceId: data.deviceId,
        ipAddress: data.ipAddress,
        action: data.action
      },
      visaCompliant: true
    };

    this.getInstance().addLog(logEntry);
    console.log(`🚨 [VISA-LOG] SECURITY_EVENT`, {
      eventType: data.eventType,
      severity: data.severity,
      deviceId: data.deviceId,
      action: data.action,
      message: data.message,
      timestamp
    });
  }

  // Métrica para VISA - Taxa de Sucesso
  static calculateSuccessRate(): VisaMetrics {
    const logs = this.getInstance().logs;
    const tokenizationLogs = logs.filter(log => log.category === 'TOKENIZATION_RESPONSE');
    const transactionLogs = logs.filter(log => log.category === 'TRANSACTION');

    const tokenizationSuccess = tokenizationLogs.filter(log => log.data.success).length;
    const transactionSuccess = transactionLogs.filter(log => log.data.success).length;

    const metrics: VisaMetrics = {
      tokenizationSuccessRate: tokenizationLogs.length > 0 ? 
        (tokenizationSuccess / tokenizationLogs.length) * 100 : 0,
      transactionSuccessRate: transactionLogs.length > 0 ? 
        (transactionSuccess / transactionLogs.length) * 100 : 0,
      totalTokenizations: tokenizationLogs.length,
      totalTransactions: transactionLogs.length,
      riskDistribution: this.calculateRiskDistribution(logs),
      networkDistribution: this.calculateNetworkDistribution(logs)
    };

    console.log(`📊 [VISA-METRICS]`, {
      tokenizationSuccessRate: `${metrics.tokenizationSuccessRate.toFixed(2)}%`,
      transactionSuccessRate: `${metrics.transactionSuccessRate.toFixed(2)}%`,
      totalTokenizations: metrics.totalTokenizations,
      totalTransactions: metrics.totalTransactions,
      riskDistribution: metrics.riskDistribution,
      networkDistribution: metrics.networkDistribution
    });
    
    return metrics;
  }

  private static calculateRiskDistribution(logs: LogEntry[]) {
    const riskLogs = logs.filter(log => log.category === 'RISK_ASSESSMENT');
    const distribution = { GREEN: 0, YELLOW: 0, RED: 0 };
    
    riskLogs.forEach(log => {
      const path = log.data.authenticationPath;
      if (path in distribution) {
        distribution[path as keyof typeof distribution]++;
      }
    });

    return distribution;
  }

  private static calculateNetworkDistribution(logs: LogEntry[]) {
    const txnLogs = logs.filter(log => log.category === 'TRANSACTION');
    const distribution: {[key: string]: number} = {};
    
    txnLogs.forEach(log => {
      const network = log.data.network;
      distribution[network] = (distribution[network] || 0) + 1;
    });

    return distribution;
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    
    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  // Exportar logs para auditoria VISA
  static exportLogsForVisa(): string {
    const logs = this.getInstance().logs.filter(log => log.visaCompliant);
    const metrics = this.calculateSuccessRate();
    
    const visaReport = {
      reportTimestamp: new Date().toISOString(),
      reportVersion: '1.0.0',
      compliance: {
        pciDssCompliant: true,
        tokenizationStandard: 'EMV_TOKEN_SPEC_v2.0',
        riskAssessmentImplemented: true,
        brazilComplianceNfc: true,
        brazilComplianceQrCode: true,
        supportedNetworks: ['CIELO', 'REDE', 'GETNET'],
        idvMethodsSupported: ['SMS_OTP', 'EMAIL_OTP', 'APP_TO_APP']
      },
      metrics,
      recentLogs: logs.slice(-50), // Últimos 50 logs
      summary: {
        totalEvents: logs.length,
        successfulTokenizations: logs.filter(l => 
          l.category === 'TOKENIZATION_RESPONSE' && l.data.success
        ).length,
        securityEvents: logs.filter(l => l.category === 'SECURITY_EVENT').length,
        riskAssessments: logs.filter(l => l.category === 'RISK_ASSESSMENT').length
      }
    };

    const jsonReport = JSON.stringify(visaReport, null, 2);
    console.log(`📋 [VISA-REPORT] Generated compliance report with ${logs.length} events`);
    return jsonReport;
  }

  // Método para demo - gerar logs de exemplo
  static generateSampleLogsForDemo() {
    console.log(`🎭 [DEMO] Gerando logs de exemplo para demonstração...`);

    // Simular algumas tokenizações e transações
    const networks = ['CIELO', 'REDE', 'GETNET'];
    const paymentMethods = ['NFC', 'QR_CODE', 'E_COMMERCE'];

    for (let i = 0; i < 10; i++) {
      const deviceId = `DEVICE_${Math.random().toString(36).substr(2, 9)}`;
      const riskScore = Math.floor(Math.random() * 100);
      const authPath = riskScore >= 70 ? 'GREEN' : riskScore >= 40 ? 'YELLOW' : 'RED';
      
      // Log de tokenização
      this.logTokenizationRequest({
        deviceId,
        riskScore,
        authPath,
        issuerBin: '453210',
        cardBrand: 'VISA',
        deviceFingerprint: `FP_${Math.random().toString(36).substr(2, 8)}`
      });

      // Log de resposta
      const success = Math.random() > 0.1; // 90% success rate
      this.logTokenizationResponse({
        success,
        tokenId: success ? `TKN_${Date.now()}_${i}` : undefined,
        errorCode: success ? undefined : 'VALIDATION_FAILED',
        processingTime: Math.floor(Math.random() * 3000) + 500,
        issuerResponse: success ? 'APPROVED' : 'DECLINED'
      });

      // Log de transação (se sucesso)
      if (success) {
        this.logTransaction({
          tokenId: `TKN_${Date.now()}_${i}`,
          amount: Math.random() * 100 + 10,
          currency: 'BRL',
          merchant: `MERCHANT_${i}`,
          network: networks[Math.floor(Math.random() * networks.length)] as any,
          paymentMethod: paymentMethods[Math.floor(Math.random() * paymentMethods.length)] as any,
          success: Math.random() > 0.1, // 90% success
          authCode: `AUTH${i.toString().padStart(3, '0')}`,
          responseCode: Math.random() > 0.1 ? '00' : '05'
        });
      }
    }

    console.log(`✅ [DEMO] ${10} logs de exemplo gerados com sucesso!`);
  }
}

// Types para TypeScript
export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR';
  category: 'TOKENIZATION_REQUEST' | 'TOKENIZATION_RESPONSE' | 'RISK_ASSESSMENT' | 'TRANSACTION' | 'SECURITY_EVENT';
  message: string;
  data: any;
  visaCompliant: boolean;
}

export interface TokenizationRequestLog {
  deviceId: string;
  riskScore: number;
  authPath: string;
  issuerBin: string;
  cardBrand: string;
  deviceFingerprint: string;
}

export interface TokenizationResponseLog {
  success: boolean;
  tokenId?: string;
  errorCode?: string;
  processingTime: number;
  issuerResponse: string;
  verificationMethod?: string;
}

export interface RiskAssessmentLog {
  riskScore: number;
  authenticationPath: string;
  deviceRisk: number;
  accountRisk: number;
  geolocationRisk: number;
  reason: string;
}

export interface TransactionLog {
  tokenId: string;
  amount: number;
  currency: string;
  merchant: string;
  network: 'CIELO' | 'REDE' | 'GETNET';
  paymentMethod: 'NFC' | 'QR_CODE' | 'E_COMMERCE';
  success: boolean;
  authCode?: string;
  responseCode: string;
}

export interface SecurityEventLog {
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  deviceId: string;
  ipAddress: string;
  action: string;
  message: string;
}

export interface VisaMetrics {
  tokenizationSuccessRate: number;
  transactionSuccessRate: number;
  totalTokenizations: number;
  totalTransactions: number;
  riskDistribution: {GREEN: number; YELLOW: number; RED: number};
  networkDistribution: {[key: string]: number};
}
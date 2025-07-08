// src/services/CelcoinAuthService.ts
export class CelcoinAuthService {
  private static readonly AUTH_URL = 'https://sandbox.openfinance.celcoin.dev/v5/token';
  private static readonly CLIENT_ID = '41b44ab9a56440.teste.celcoinapi.v5';
  private static readonly CLIENT_SECRET = 'e9d15cde33024c1494de7480e69b7a18c09d7cd25a8446839b3be82a56a044a3';
  private static readonly GRANT_TYPE = 'client_credentials';

  /**
   * Obtém token de acesso da API Celcoin
   */
  static async authenticate(): Promise<CelcoinAuthResponse> {
    console.log('🔐 [CELCOIN-AUTH] Iniciando autenticação...');
    
    try {
      const formData = new URLSearchParams();
      formData.append('client_id', this.CLIENT_ID);
      formData.append('grant_type', this.GRANT_TYPE);
      formData.append('client_secret', this.CLIENT_SECRET);

      const response = await fetch(this.AUTH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
          'User-Agent': 'VISA-Wallet-POC/1.0.0'
        },
        body: formData.toString()
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data: CelcoinTokenResponse = await response.json();
      
      const authResponse: CelcoinAuthResponse = {
        success: true,
        accessToken: data.access_token,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        expiresAt: new Date(Date.now() + (data.expires_in * 1000))
      };

      console.log('✅ [CELCOIN-AUTH] Autenticação realizada com sucesso');
      console.log(`🕒 [CELCOIN-AUTH] Token válido até: ${authResponse.expiresAt?.toLocaleString('pt-BR')}`);
      
      return authResponse;

    } catch (error) {
      console.error('❌ [CELCOIN-AUTH] Erro na autenticação:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido na autenticação'
      };
    }
  }

  /**
   * Verifica se o token ainda é válido
   */
  static isTokenValid(expiresAt?: Date): boolean {
    if (!expiresAt) return false;
    
    // Considera expirado se faltam menos de 5 minutos
    const fiveMinutesFromNow = new Date(Date.now() + (5 * 60 * 1000));
    const isValid = expiresAt > fiveMinutesFromNow;
    
    if (!isValid) {
      console.log('⚠️ [CELCOIN-AUTH] Token expirado ou próximo do vencimento');
    }
    
    return isValid;
  }

  /**
   * Formata token para uso em headers Authorization
   */
  static formatAuthHeader(token: string, tokenType: string = 'bearer'): string {
    return `${tokenType.charAt(0).toUpperCase() + tokenType.slice(1)} ${token}`;
  }

  /**
   * Gera headers padrão para requisições Celcoin autenticadas
   */
  static generateAuthHeaders(token: string, tokenType: string = 'bearer'): Record<string, string> {
    return {
      'Authorization': this.formatAuthHeader(token, tokenType),
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'VISA-Wallet-POC/1.0.0',
      'X-VISA-Integration': 'CELCOIN_DEVICE_TOKENIZATION'
    };
  }

  /**
   * Testa conectividade com a API Celcoin
   */
  static async testConnection(): Promise<boolean> {
    try {
      console.log('🔍 [CELCOIN-AUTH] Testando conectividade...');
      
      const response = await fetch(this.AUTH_URL, {
        method: 'HEAD',
        headers: {
          'User-Agent': 'VISA-Wallet-POC/1.0.0'
        }
      });

      const isConnected = response.status < 500; // Qualquer status < 500 indica conectividade
      
      if (isConnected) {
        console.log('✅ [CELCOIN-AUTH] Conectividade OK');
      } else {
        console.log('❌ [CELCOIN-AUTH] Problema de conectividade');
      }
      
      return isConnected;
    } catch (error) {
      console.error('❌ [CELCOIN-AUTH] Erro de conectividade:', error);
      return false;
    }
  }

  /**
   * Calcula tempo restante do token em minutos
   */
  static getTokenTimeRemaining(expiresAt?: Date): number {
    if (!expiresAt) return 0;
    
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    return Math.max(0, diffMinutes);
  }

  /**
   * Renova token automaticamente se necessário
   */
  static async refreshTokenIfNeeded(currentToken?: CelcoinAuthResponse): Promise<CelcoinAuthResponse> {
    if (currentToken && this.isTokenValid(currentToken.expiresAt)) {
      console.log('ℹ️ [CELCOIN-AUTH] Token ainda válido, não é necessário renovar');
      return currentToken;
    }

    console.log('🔄 [CELCOIN-AUTH] Token expirado, renovando...');
    return await this.authenticate();
  }
}

// Types específicos para autenticação Celcoin
export interface CelcoinTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

export interface CelcoinAuthResponse {
  success: boolean;
  accessToken?: string;
  expiresIn?: number;
  tokenType?: string;
  expiresAt?: Date;
  error?: string;
}

// Configurações de ambiente para autenticação
export const CELCOIN_AUTH_CONFIG = {
  SANDBOX: {
    authUrl: 'https://sandbox.openfinance.celcoin.dev/v5/token',
    cardsApiUrl: 'https://sandbox-apicorp.celcoin.com.br/cards/v1',
    clientId: '41b44ab9a56440.teste.celcoinapi.v5',
    environment: 'SANDBOX'
  },
  PRODUCTION: {
    authUrl: 'https://openfinance.celcoin.dev/v5/token',
    cardsApiUrl: 'https://apicorp.celcoin.com.br/cards/v1',
    clientId: 'PRODUCTION_CLIENT_ID', // ⚠️ Substituir em produção
    environment: 'PRODUCTION'
  }
} as const;

/**
 * Helper para obter configuração baseada no ambiente
 */
export function getCelcoinAuthConfig(environment: 'SANDBOX' | 'PRODUCTION' = 'SANDBOX') {
  return CELCOIN_AUTH_CONFIG[environment];
}

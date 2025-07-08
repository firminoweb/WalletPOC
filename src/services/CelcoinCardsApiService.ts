// src/services/CelcoinCardsApiService.ts
import {CelcoinAuthService} from './CelcoinAuthService';

export class CelcoinCardsApiService {
  private static readonly CARDS_API_URL = 'https://sandbox-apicorp.celcoin.com.br/cards/v1';

  /**
   * Helper para fazer requisições autenticadas para a API de Cards
   */
  private static async makeAuthenticatedRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string
  ): Promise<T> {
    if (!accessToken) {
      throw new Error('Token de acesso necessário para chamar API Celcoin Cards');
    }

    const url = `${this.CARDS_API_URL}${endpoint}`;
    const headers = CelcoinAuthService.generateAuthHeaders(accessToken);

    console.log(`🌐 [CELCOIN-CARDS-API] ${options.method || 'GET'} ${endpoint}`);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [CELCOIN-CARDS-API] Erro ${response.status}: ${errorText}`);
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`✅ [CELCOIN-CARDS-API] Resposta recebida:`, data);
    return data;
  }

  /**
   * 🆕 Criar Cartão Virtual (Device Token)
   */
  static async createVirtualCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardData: CreateCardRequest
  ): Promise<CelcoinCardResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card`;
    
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(cardData),
    }, accessToken);
  }

  /**
   * 🔍 Buscar Cartão por ID
   */
  static async getCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId?: number,
    filters?: {
      document?: number;
      status?: string;
      type?: 'PLASTIC' | 'VIRTUAL';
    }
  ): Promise<CelcoinCardResponse> {
    let endpoint = `/accounts/${accountId}/customers/${customerId}/card`;
    
    const params = new URLSearchParams();
    if (cardId) params.append('cardId', cardId.toString());
    if (filters?.document) params.append('document', filters.document.toString());
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeAuthenticatedRequest(endpoint, {method: 'GET'}, accessToken);
  }

  /**
   * 📋 Listar Cartões com Paginação
   */
  static async listCards(
    accessToken: string,
    accountId: number,
    customerId: number,
    pagination?: {
      page?: number;
      perPage?: number;
      status?: string;
      modes?: 'DEBIT' | 'CREDIT' | 'COMBO';
      type?: 'PLASTIC' | 'VIRTUAL';
    }
  ): Promise<CelcoinCardsListResponse> {
    let endpoint = `/accounts/${accountId}/customers/${customerId}/card/cards`;
    
    const params = new URLSearchParams();
    if (pagination?.page) params.append('page', pagination.page.toString());
    if (pagination?.perPage) params.append('perPage', pagination.perPage.toString());
    if (pagination?.status) params.append('status', pagination.status);
    if (pagination?.modes) params.append('modes', pagination.modes);
    if (pagination?.type) params.append('type', pagination.type);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    return this.makeAuthenticatedRequest(endpoint, {method: 'GET'}, accessToken);
  }

  /**
   * ✅ Ativar Cartão
   */
  static async activateCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/activate`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'PUT'}, accessToken);
  }

  /**
   * 🚫 Bloquear Cartão
   */
  static async blockCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/block`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'PUT'}, accessToken);
  }

  /**
   * 🔓 Desbloquear Cartão
   */
  static async unblockCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/unblock`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'PUT'}, accessToken);
  }

  /**
   * 🪙 Obter Tokens do Cartão
   */
  static async getCardTokens(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number
  ): Promise<CelcoinTokensResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/token`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'GET'}, accessToken);
  }

  /**
   * ℹ️ Informações Detalhadas do Token
   */
  static async getTokenInfo(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number,
    tokenId: number
  ): Promise<CelcoinTokenInfoResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/token/${tokenId}/info`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'GET'}, accessToken);
  }

  /**
   * ⚙️ Operações no Token (SUSPENDER, ATIVAR, DELETE)
   */
  static async manageToken(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number,
    tokenId: number,
    operation: TokenOperation
  ): Promise<CelcoinTokenOperationResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/network-tokens/${tokenId}`;
    
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(operation),
    }, accessToken);
  }

  /**
   * 🔄 Transferir Token Entre Cartões
   */
  static async transferToken(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number,
    destinyCardId: number
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/token/transfer?destinyCardId=${destinyCardId}`;
    
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify({ destinyCardId }),
    }, accessToken);
  }

  /**
   * 🔄 Atualizar Dados do Cartão
   */
  static async updateCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number,
    updateData: UpdateCardRequest
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}?card=${cardId}`;
    
    return this.makeAuthenticatedRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    }, accessToken);
  }

  /**
   * ❌ Cancelar Cartão
   */
  static async cancelCard(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/cancel`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'PUT'}, accessToken);
  }

  /**
   * 🔐 Obter Informações do Cartão (incluindo dados sensíveis)
   */
  static async getCardInfo(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardId: number
  ): Promise<CelcoinResponse> {
    const endpoint = `/accounts/${accountId}/customers/${customerId}/card/${cardId}/info`;
    
    return this.makeAuthenticatedRequest(endpoint, {method: 'GET'}, accessToken);
  }

  /**
   * Helper: Criar Cartão Virtual para VISA Device Tokenization
   */
  static async createVISADeviceToken(
    accessToken: string,
    accountId: number,
    customerId: number,
    cardholderName: string,
    options?: {
      transactionLimit?: number;
      cvvRotationHours?: number;
    }
  ): Promise<CelcoinCardResponse> {
    const cardData: CreateCardRequest = {
      name: `VISA Device Token - ${cardholderName}`,
      printedName: cardholderName,
      type: 'VIRTUAL',
      cvvRotationIntervalHours: options?.cvvRotationHours || 24,
      transactionLimit: options?.transactionLimit || 500000, // R$ 5.000
      contactlessEnabled: true,
      modeType: 'COMBO' // Suporta débito e crédito
    };

    console.log('🎯 [CELCOIN-CARDS-API] Criando VISA Device Token...');
    
    const result = await this.createVirtualCard(accessToken, accountId, customerId, cardData);
    
    // Ativar automaticamente
    if (result.status === 200 && result.body?.id) {
      console.log('🔑 [CELCOIN-CARDS-API] Ativando cartão virtual...');
      await this.activateCard(accessToken, accountId, customerId, result.body.id);
    }

    return result;
  }
}

// Types para a API de Cards
export interface CreateCardRequest {
  name: string;
  printedName: string;
  type: 'PLASTIC' | 'VIRTUAL';
  cvvRotationIntervalHours?: number;
  embossingGroup?: string;
  abuEnabled?: boolean;
  transactionLimit?: number;
  contactlessEnabled?: boolean;
  modeType?: 'SINGLE' | 'COMBO';
}

export interface UpdateCardRequest {
  contactlessEnabled?: boolean;
  name?: string;
  printedName?: string;
  transactionLimit?: number;
}

export interface TokenOperation {
  operationReason: string;
  operationType: 'SUSPENDER' | 'ATIVAR' | 'DELETE';
}

export interface CelcoinResponse {
  version: string;
  status: number;
  body?: any;
  error?: {
    errorCode: string;
    message: string;
  };
}

export interface CelcoinCardResponse extends CelcoinResponse {
  body?: {
    id: number;
    lastDigits: string;
    status: string;
    function: string;
    bin: string;
    type: string;
    expirationDate: string;
    name?: string;
    printedName?: string;
    customerId?: number;
    tenantCostCenter?: number;
  };
}

export interface CelcoinCardsListResponse extends CelcoinResponse {
  body?: {
    data: Array<{
      id: number;
      lastDigits: string;
      status: string;
      function: string;
      bin: string;
      type: string;
      expirationDate: string;
    }>;
  };
}

export interface CelcoinTokensResponse extends CelcoinResponse {
  body?: any[];
}

export interface CelcoinTokenInfoResponse extends CelcoinResponse {
  body?: {
    token: {
      key: {
        tokenRef: string;
        panRef: string;
        paymentNetwork: string;
      };
      tokenId: string;
      accountId: number;
      programId: string;
      cardId: number;
      walletId: string;
      status: string;
      updatedAt: string;
    };
  };
}

export interface CelcoinTokenOperationResponse extends CelcoinResponse {
  body?: {
    id: number;
    cardId: number;
    cardTokenId: number;
    operationReason: string;
    operationType: string;
    activationCode: number;
    operatorId: string;
  };
}

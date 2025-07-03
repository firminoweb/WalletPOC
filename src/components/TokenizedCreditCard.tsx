// src/components/TokenizedCreditCard.tsx
import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {TokenizedCard} from '../types/TokenizedCard';

const {width} = Dimensions.get('window');

interface Props {
  card: TokenizedCard;
  showTokenInfo?: boolean;
}

const TokenizedCreditCard: React.FC<Props> = ({card, showTokenInfo = false}) => {
  const getBrandLogo = (brand: string): string => {
    switch (brand?.toLowerCase()) {
      case 'visa': return 'VISA';
      case 'mastercard': return 'MASTERCARD';
      case 'amex': return 'AMEX';
      case 'elo': return 'ELO';
      default: return 'CARD';
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'SUSPENDED': return '#f59e0b';
      case 'DELETED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getAuthPathColor = (path: string): string => {
    switch (path) {
      case 'GREEN': return '#10b981';
      case 'YELLOW': return '#f59e0b';
      case 'RED': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: card.color}]}>
      {/* Header com status */}
      <View style={styles.cardHeader}>
        <Text style={styles.brandText}>{getBrandLogo(card.brand)}</Text>
        <View style={styles.statusContainer}>
          <View style={[styles.statusDot, {backgroundColor: getStatusColor(card.tokenStatus)}]} />
          <Text style={styles.statusText}>{card.tokenStatus}</Text>
        </View>
      </View>

      {/* Número tokenizado */}
      <View style={styles.cardNumber}>
        <Text style={styles.numberText}>{card.maskedPan}</Text>
        {showTokenInfo && (
          <Text style={styles.tokenText}>Token: {card.paymentToken.slice(0, 8)}***</Text>
        )}
      </View>

      {/* Informações do portador */}
      <View style={styles.cardFooter}>
        <View style={styles.holderContainer}>
          <Text style={styles.labelText}>PORTADOR</Text>
          <Text style={styles.holderText}>{card.holder}</Text>
        </View>
        <View style={styles.expiryContainer}>
          <Text style={styles.labelText}>VÁLIDO ATÉ</Text>
          <Text style={styles.expiryText}>{card.expiry}</Text>
        </View>
      </View>

      {/* Informações de tokenização */}
      {showTokenInfo && (
        <View style={styles.tokenInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Caminho: </Text>
            <View style={[styles.pathBadge, {backgroundColor: getAuthPathColor(card.authenticationPath)}]}>
              <Text style={styles.pathText}>{card.authenticationPath}</Text>
            </View>
            <Text style={styles.infoValue}>Score: {card.riskScore}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Transações: {card.transactionCount}</Text>
            <Text style={styles.infoLabel}>Provider: {card.tokenProvider}</Text>
          </View>
        </View>
      )}

      {/* Métodos de pagamento suportados */}
      <View style={styles.paymentMethods}>
        {card.supportedMethods.map((method, index) => (
          method.enabled && (
            <View key={index} style={styles.methodBadge}>
              <Text style={styles.methodText}>
                {method.type === 'NFC' ? '📱' : method.type === 'QR_CODE' ? '📲' : '💳'}
              </Text>
            </View>
          )
        ))}
      </View>

      {/* Background decoration */}
      <View style={styles.cardBackground}>
        <View style={styles.circle1} />
        <View style={styles.circle2} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: width * 0.85,
    minHeight: 220,
    borderRadius: 16,
    padding: 20,
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
  },
  cardNumber: {
    marginVertical: 8,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  tokenText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontFamily: 'monospace',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  holderContainer: {
    flex: 1,
  },
  expiryContainer: {
    alignItems: 'flex-end',
  },
  labelText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '500',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  holderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  expiryText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  tokenInfo: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginRight: 8,
  },
  infoValue: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 8,
  },
  pathBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  pathText: {
    color: '#ffffff',
    fontSize: 8,
    fontWeight: 'bold',
  },
  paymentMethods: {
    flexDirection: 'row',
    marginTop: 8,
  },
  methodBadge: {
    marginRight: 6,
  },
  methodText: {
    fontSize: 14,
  },
  cardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle1: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    top: -40,
    right: -40,
  },
  circle2: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: -20,
    left: -20,
  },
});

export default TokenizedCreditCard;

// src/components/CreditCard.tsx
import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {Card, CardBrand} from '../types/Card';

const {width} = Dimensions.get('window');

interface Props {
  card: Card;
}

const CreditCard: React.FC<Props> = ({card}) => {
  const getBrandLogo = (brand: CardBrand): string => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'VISA';
      case 'mastercard':
        return 'MASTERCARD';
      case 'amex':
        return 'AMEX';
      case 'discover':
        return 'DISCOVER';
      default:
        return 'CARD';
    }
  };

  const formatCardNumber = (number: string): string => {
    const cleaned = number.replace(/\s/g, '');
    const masked = cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '**** **** **** $4');
    return masked;
  };

  return (
    <View style={[styles.card, {backgroundColor: card.color || '#1e40af'}]}>
      <View style={styles.cardHeader}>
        <Text style={styles.brandText}>{getBrandLogo(card.brand)}</Text>
        <View style={styles.chipContainer}>
          <View style={styles.chip} />
        </View>
      </View>

      <View style={styles.cardNumber}>
        <Text style={styles.numberText}>{formatCardNumber(card.number)}</Text>
      </View>

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
    height: 200,
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
  chipContainer: {
    alignItems: 'flex-end',
  },
  chip: {
    width: 32,
    height: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.5)',
  },
  cardNumber: {
    marginVertical: 10,
  },
  numberText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '600',
    letterSpacing: 2,
    fontFamily: 'monospace',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  expiryText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'monospace',
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

export default CreditCard;

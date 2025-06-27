// src/screens/CardDetailsScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {RouteProp} from '@react-navigation/native';
import {useWallet} from '../context/WalletContext';
import CreditCard from '../components/CreditCard';
import {CardBrand, Card} from '../types/Card';

type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
  CardDetails: {card: Card};
};

type CardDetailsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CardDetails'>;
type CardDetailsScreenRouteProp = RouteProp<RootStackParamList, 'CardDetails'>;

interface Props {
  navigation: CardDetailsScreenNavigationProp;
  route: CardDetailsScreenRouteProp;
}

const CardDetailsScreen: React.FC<Props> = ({route, navigation}) => {
  const {card} = route.params;
  const {removeCard} = useWallet();
  const [showFullNumber, setShowFullNumber] = useState<boolean>(false);

  const handleRemoveCard = (): void => {
    Alert.alert(
      'Remover Cartão',
      'Tem certeza que deseja remover este cartão?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Remover',
          style: 'destructive',
          onPress: () => {
            removeCard(card.id);
            navigation.goBack();
          },
        },
      ],
    );
  };

  const formatCardNumber = (number: string, showFull: boolean): string => {
    if (showFull) {
      return number;
    }
    const cleaned = number.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '**** **** **** $4');
  };

  const getBrandName = (brand: CardBrand): string => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'discover':
        return 'Discover';
      default:
        return 'Cartão de Crédito';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.cardContainer}>
          <CreditCard card={card} />
        </View>

        <View style={styles.detailsContainer}>
          <Text style={styles.sectionTitle}>Informações do Cartão</Text>
          
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Bandeira</Text>
            <Text style={styles.detailValue}>{getBrandName(card.brand)}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Número do Cartão</Text>
            <View style={styles.numberContainer}>
              <Text style={[styles.detailValue, styles.numberText]}>
                {formatCardNumber(card.number, showFullNumber)}
              </Text>
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => setShowFullNumber(!showFullNumber)}>
                <Text style={styles.toggleButtonText}>
                  {showFullNumber ? 'Ocultar' : 'Mostrar'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Portador</Text>
            <Text style={styles.detailValue}>{card.holder}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Validade</Text>
            <Text style={styles.detailValue}>{card.expiry}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>CVV</Text>
            <Text style={styles.detailValue}>
              {showFullNumber ? card.cvv : '***'}
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={handleRemoveCard}
            activeOpacity={0.8}>
            <Text style={styles.removeButtonText}>Remover Cartão</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  cardContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  detailsContainer: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 10,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 20,
  },
  detailItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  numberContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  numberText: {
    fontFamily: 'monospace',
    flex: 1,
  },
  toggleButton: {
    backgroundColor: '#e5e7eb',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 10,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#374151',
  },
  actionsContainer: {
    padding: 20,
    paddingTop: 0,
  },
  removeButton: {
    backgroundColor: '#ef4444',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#ef4444',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  removeButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CardDetailsScreen;

// src/screens/HomeScreen.tsx - Atualizado para POC VISA
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  ListRenderItem,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useWallet} from '../context/WalletContext';
import CreditCard from '../components/CreditCard';
import {Card} from '../types/Card';
import {VISATokenizationResult} from '../services/CelcoinTokenizationService';

const {width} = Dimensions.get('window');

type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
  CardDetails: {card: Card};
  VISATokenization: undefined;
  VISAResult: {result: VISATokenizationResult};
};

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({navigation}) => {
  const {cards} = useWallet();

  const renderCard: ListRenderItem<Card> = ({item}) => (
    <TouchableOpacity
      style={styles.cardContainer}
      onPress={() => navigation.navigate('CardDetails', {card: item})}
      activeOpacity={0.9}>
      <CreditCard card={item} />
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>Nenhum cartão adicionado</Text>
      <Text style={styles.emptyStateSubtitle}>
        Use VISA Device Tokenization ou adicione manualmente
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Header com badge VISA */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>Meus Cartões</Text>
          <View style={styles.visaBadge}>
            <Text style={styles.visaBadgeText}>VISA POC</Text>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
        </Text>
      </View>

      {/* Lista de Cartões */}
      <FlatList
        data={cards}
        renderItem={renderCard}
        keyExtractor={(item: Card) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsList}
        ListEmptyComponent={renderEmptyState}
        snapToInterval={width * 0.85 + 20}
        decelerationRate="fast"
      />

      {/* ✅ NOVO: Botão principal VISA Device Tokenization */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.visaButton}
          onPress={() => navigation.navigate('VISATokenization')}
          activeOpacity={0.8}>
          <View style={styles.visaButtonContent}>
            <Text style={styles.visaButtonIcon}>🏦</Text>
            <View style={styles.visaButtonTextContainer}>
              <Text style={styles.visaButtonTitle}>VISA Device Tokenization</Text>
              <Text style={styles.visaButtonSubtitle}>POC Certificação VISA Brasil via Celcoin</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Botão secundário para método tradicional */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddCard')}
          activeOpacity={0.8}>
          <Text style={styles.addButtonText}>+ Adicionar Cartão (Tradicional)</Text>
        </TouchableOpacity>
      </View>

      {/* Footer com informações da POC */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          POC - Proof of Concept para Device Tokenization VISA
        </Text>
        <Text style={styles.footerSubtext}>
          Integração: Celcoin/Pismo • Compliance: VISA Brasil 2024
        </Text>
      </View>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  visaBadge: {
    backgroundColor: '#1434a4',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  visaBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
  },
  cardsList: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  cardContainer: {
    marginRight: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionsContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  // ✅ NOVO: Estilo do botão principal VISA
  visaButton: {
    backgroundColor: '#1434a4',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#1434a4',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  visaButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visaButtonIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  visaButtonTextContainer: {
    flex: 1,
  },
  visaButtonTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  visaButtonSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    lineHeight: 18,
  },
  // Botão secundário (método tradicional)
  addButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  addButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  // ✅ NOVO: Footer com informações da POC
  footer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '600',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default HomeScreen;

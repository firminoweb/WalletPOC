// src/screens/HomeScreen.tsx
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

const {width} = Dimensions.get('window');

// Type para navegação - você pode definir depois no App.tsx
type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
  CardDetails: {card: Card};
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
        Adicione seu primeiro cartão para começar
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Cartões</Text>
        <Text style={styles.subtitle}>
          {cards.length} {cards.length === 1 ? 'cartão' : 'cartões'}
        </Text>
      </View>

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

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddCard')}
        activeOpacity={0.8}>
        <Text style={styles.addButtonText}>+ Adicionar Cartão</Text>
      </TouchableOpacity>
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
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
  addButton: {
    backgroundColor: '#6366f1',
    marginHorizontal: 20,
    marginBottom: 30,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default HomeScreen;

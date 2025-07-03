// src/screens/AddCardScreen.tsx
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {StackNavigationProp} from '@react-navigation/stack';
import {useWallet} from '../context/WalletContext';

// Funções de validação e formatação
const validateCardNumber = (number: string): boolean => {
  const cleaned = number.replace(/\s/g, '');
  
  if (!/^\d+$/.test(cleaned) || cleaned.length < 13 || cleaned.length > 19) {
    return false;
  }

  // Algoritmo de Luhn
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  return sum % 10 === 0;
};

// Tipos para CardBrand
type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

const detectCardBrand = (number: string): CardBrand => {
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
};

const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/\d{1,4}/g);
  return match ? match.join(' ') : '';
};

const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{0,2})$/);
  
  if (match) {
    return match[2] ? `${match[1]}/${match[2]}` : match[1];
  }
  
  return cleaned;
};

interface Card {
  id: string;
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
  brand: CardBrand;
  color: string;
  createdAt?: Date;
  isActive?: boolean;
}

// Tipos para navegação
type RootStackParamList = {
  Home: undefined;
  AddCard: undefined;
  CardDetails: {card: Card};
};

type AddCardScreenNavigationProp = StackNavigationProp<RootStackParamList, 'AddCard'>;

interface Props {
  navigation: AddCardScreenNavigationProp;
}

interface CardFormData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

interface FormErrors {
  number?: string;
  holder?: string;
  expiry?: string;
  cvv?: string;
}

const AddCardScreen: React.FC<Props> = ({navigation}) => {
  const {addCard} = useWallet();
  const [formData, setFormData] = useState<CardFormData>({
    number: '',
    holder: '',
    expiry: '',
    cvv: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const cardColors: string[] = [
    '#1e40af', '#dc2626', '#059669', '#7c3aed', 
    '#ea580c', '#0891b2', '#be185d', '#374151'
  ];
  const [selectedColor, setSelectedColor] = useState<string>(cardColors[0]);

  const handleInputChange = (field: keyof CardFormData, value: string): void => {
    let formattedValue = value;

    if (field === 'number') {
      formattedValue = formatCardNumber(value);
    } else if (field === 'expiry') {
      formattedValue = formatExpiry(value);
    } else if (field === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 4);
    } else if (field === 'holder') {
      formattedValue = value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [field]: formattedValue,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.number || !validateCardNumber(formData.number)) {
      newErrors.number = 'Número do cartão inválido';
    }

    if (!formData.holder.trim() || formData.holder.trim().length < 2) {
      newErrors.holder = 'Nome do portador é obrigatório';
    }

    if (!formData.expiry || !/^\d{2}\/\d{2}$/.test(formData.expiry)) {
      newErrors.expiry = 'Data de validade inválida (MM/AA)';
    } else {
      const [month, year] = formData.expiry.split('/');
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear() % 100;
      
      const monthNum = parseInt(month, 10);
      const yearNum = parseInt(year, 10);
      
      if (monthNum < 1 || monthNum > 12) {
        newErrors.expiry = 'Mês inválido';
      } else if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
        newErrors.expiry = 'Cartão expirado';
      }
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = 'CVV deve ter 3 ou 4 dígitos';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      const newCard: Omit<Card, 'id'> = {
        number: formData.number,
        holder: formData.holder.trim(),
        expiry: formData.expiry,
        cvv: formData.cvv,
        brand: detectCardBrand(formData.number),
        color: selectedColor,
        createdAt: new Date(),
        isActive: true,
      };

      addCard(newCard);
      Alert.alert('Sucesso', 'Cartão adicionado com sucesso!', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.form}>
            
            {/* NÚMERO DO CARTÃO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Número do Cartão</Text>
              <TextInput
                style={[styles.input, errors.number && styles.inputError]}
                value={formData.number}
                onChangeText={value => handleInputChange('number', value)}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                maxLength={19}
              />
              {errors.number ? <Text style={styles.errorText}>{errors.number}</Text> : null}
            </View>

            {/* NOME DO PORTADOR */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nome do Portador</Text>
              <TextInput
                style={[styles.input, errors.holder && styles.inputError]}
                value={formData.holder}
                onChangeText={value => handleInputChange('holder', value)}
                placeholder="João Silva"
                placeholderTextColor="#9ca3af"
                autoCapitalize="words"
              />
              {errors.holder ? <Text style={styles.errorText}>{errors.holder}</Text> : null}
            </View>

            {/* VALIDADE E CVV */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>Validade</Text>
                <TextInput
                  style={[styles.input, errors.expiry && styles.inputError]}
                  value={formData.expiry}
                  onChangeText={value => handleInputChange('expiry', value)}
                  placeholder="MM/AA"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={5}
                />
                {errors.expiry ? <Text style={styles.errorText}>{errors.expiry}</Text> : null}
              </View>

              <View style={[styles.inputGroup, styles.halfWidth]}>
                <Text style={styles.label}>CVV</Text>
                <TextInput
                  style={[styles.input, errors.cvv && styles.inputError]}
                  value={formData.cvv}
                  onChangeText={value => handleInputChange('cvv', value)}
                  placeholder="123"
                  placeholderTextColor="#9ca3af"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
                {errors.cvv ? <Text style={styles.errorText}>{errors.cvv}</Text> : null}
              </View>
            </View>

            {/* SELETOR DE COR */}
            <View style={styles.colorSection}>
              <Text style={styles.label}>Cor do Cartão</Text>
              <View style={styles.colorPalette}>
                {cardColors.map(color => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      {backgroundColor: color},
                      selectedColor === color && styles.selectedColor,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>

            {/* PREVIEW DO CARTÃO */}
            <View style={styles.previewSection}>
              <Text style={styles.label}>Preview do Cartão</Text>
              <View style={[styles.miniCard, {backgroundColor: selectedColor}]}>
                <Text style={styles.miniCardBrand}>
                  {formData.number ? detectCardBrand(formData.number).toUpperCase() : 'CARTÃO'}
                </Text>
                <Text style={styles.miniCardNumber}>
                  {formData.number || '**** **** **** ****'}
                </Text>
                <View style={styles.miniCardFooter}>
                  <Text style={styles.miniCardText}>
                    {formData.holder || 'NOME DO PORTADOR'}
                  </Text>
                  <Text style={styles.miniCardText}>
                    {formData.expiry || 'MM/AA'}
                  </Text>
                </View>
              </View>
            </View>

          </View>
        </ScrollView>

        {/* BOTÃO ADICIONAR */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit}
            activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>💳 Adicionar Cartão</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  inputError: {
    borderColor: '#ef4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 4,
    fontWeight: '500',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfWidth: {
    width: '48%',
  },
  colorSection: {
    marginTop: 10,
    marginBottom: 20,
  },
  colorPalette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 12,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColor: {
    borderColor: '#6366f1',
    borderWidth: 4,
  },
  previewSection: {
    marginTop: 10,
  },
  miniCard: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    minHeight: 120,
  },
  miniCardBrand: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  miniCardNumber: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  miniCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  miniCardText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 10,
  },
  submitButton: {
    backgroundColor: '#6366f1',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#6366f1',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default AddCardScreen;
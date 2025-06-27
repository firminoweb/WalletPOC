// src/utils/cardUtils.ts
import {CardBrand} from '../types/Card';

export const validateCardNumber = (number: string): boolean => {
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

export const detectCardBrand = (number: string): CardBrand => {
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

export const formatCardNumber = (value: string): string => {
  const cleaned = value.replace(/\s/g, '');
  const match = cleaned.match(/\d{1,4}/g);
  return match ? match.join(' ') : '';
};

export const formatExpiry = (value: string): string => {
  const cleaned = value.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{2})(\d{0,2})$/);
  
  if (match) {
    return match[2] ? `${match[1]}/${match[2]}` : match[1];
  }
  
  return cleaned;
};

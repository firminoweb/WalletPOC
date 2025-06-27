export interface Card {
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

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

export interface CardFormData {
  number: string;
  holder: string;
  expiry: string;
  cvv: string;
}

export interface FormErrors {
  number?: string;
  holder?: string;
  expiry?: string;
  cvv?: string;
}

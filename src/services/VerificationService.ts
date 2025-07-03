// src/services/VerificationService.ts
export class VerificationService {
  
  static async sendSmsOtp(phoneNumber: string): Promise<{
    success: boolean;
    otpId: string;
    expiresIn: number;
    maskedPhone?: string;
  }> {
    // Simula envio de SMS OTP
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula validação do número de telefone - CORRIGIDO para sempre retornar boolean
    const isValidPhone = Boolean(phoneNumber && phoneNumber.length >= 10);
    const success = isValidPhone && Math.random() > 0.1; // 90% success rate
    
    // Mascara o telefone para exibição
    const maskedPhone = phoneNumber ? 
      phoneNumber.replace(/(\d{2})(\d+)(\d{4})/, '($1) ****-$3') : 
      undefined;
    
    console.log(`📱 SMS OTP enviado para: ${maskedPhone}`);
    
    return {
      success,
      otpId: 'SMS_OTP_' + Date.now(),
      expiresIn: 300, // 5 minutos
      maskedPhone
    };
  }
  
  static async verifyOtp(otpId: string, code: string): Promise<{
    isValid: boolean;
    remainingAttempts: number;
    message?: string;
  }> {
    // Simula verificação OTP
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Log para debug
    console.log(`🔐 Verificando OTP ${otpId} com código: ${code}`);
    
    // Para demo, aceita qualquer código que termine com '123' ou código especial
    const isValid = code.endsWith('123') || code === '000000';
    
    const remainingAttempts = isValid ? 0 : 2;
    const message = isValid ? 
      'Código verificado com sucesso!' : 
      'Código inválido. Tente novamente.';
    
    return {
      isValid,
      remainingAttempts,
      message
    };
  }
  
  static async sendEmailOtp(email: string): Promise<{
    success: boolean;
    otpId: string;
    expiresIn: number;
    maskedEmail?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simula validação do email - CORRIGIDO para sempre retornar boolean
    const isValidEmail = Boolean(email && email.includes('@') && email.includes('.'));
    const success = isValidEmail && Math.random() > 0.05; // 95% success rate para email
    
    // Mascara o email para exibição
    const maskedEmail = email ? 
      email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : 
      undefined;
    
    console.log(`📧 Email OTP enviado para: ${maskedEmail}`);
    
    return {
      success,
      otpId: 'EMAIL_OTP_' + Date.now(),
      expiresIn: 600, // 10 minutos
      maskedEmail
    };
  }
  
  /**
   * Simula verificação App-to-App (quando o usuário já está autenticado no app do banco)
   */
  static async verifyAppToApp(userId: string): Promise<{
    success: boolean;
    verificationId: string;
    method: 'BIOMETRIC' | 'PIN' | 'PASSWORD';
  }> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    console.log(`🔐 Verificação App-to-App para usuário: ${userId}`);
    
    // Simula métodos de autenticação disponíveis
    const methods: ('BIOMETRIC' | 'PIN' | 'PASSWORD')[] = ['BIOMETRIC', 'PIN', 'PASSWORD'];
    const selectedMethod = methods[Math.floor(Math.random() * methods.length)];
    
    // App-to-App tem taxa de sucesso mais alta (98%)
    const success = Math.random() > 0.02;
    
    return {
      success,
      verificationId: 'APP_VERIFY_' + Date.now(),
      method: selectedMethod
    };
  }
  
  /**
   * Simula verificação por central de atendimento
   */
  static async initiateCallCenterVerification(phoneNumber: string): Promise<{
    success: boolean;
    ticketId: string;
    estimatedWaitTime: number;
    callbackNumber?: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log(`☎️ Verificação por central iniciada para: ${phoneNumber}`);
    
    // Central de atendimento tem processo mais longo mas alta taxa de sucesso
    const success = Math.random() > 0.03; // 97% success rate
    
    return {
      success,
      ticketId: 'CALL_' + Date.now(),
      estimatedWaitTime: 300, // 5 minutos estimados
      callbackNumber: phoneNumber
    };
  }
}

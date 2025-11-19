class ApiConstants {
  // Base URL
  static const String baseUrl = 'http://192.168.1.75:3000';

  
  // Auth endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String getMe = '/auth/me';
  
  // Roast endpoints
  static const String createRoast = '/roast/create';
  static const String roastHistory = '/roast/history';
  
  // Subscription endpoints
  static const String createOrder = '/subscription/create-order';
  static const String verifyPayment = '/subscription/verify';
  static const String subscriptionStatus = '/subscription/status';
  static const String paymentHistory = '/subscription/payment-history';
}
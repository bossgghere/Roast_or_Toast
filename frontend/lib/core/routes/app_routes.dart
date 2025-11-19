import 'package:flutter/material.dart';
import '../../presentation/screens/splash_screen.dart';
// Import screens as we create them
// import '../../presentation/screens/login_screen.dart';
// import '../../presentation/screens/register_screen.dart';
// import '../../presentation/screens/home_screen.dart';
// import '../../presentation/screens/profile_screen.dart';
// import '../../presentation/screens/result_screen.dart';
// import '../../presentation/screens/subscription_screen.dart';

class AppRoutes {
  // Route names
  static const String splash = '/';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String result = '/result';
  static const String profile = '/profile';
  static const String subscription = '/subscription';

  // Route map
  static Map<String, WidgetBuilder> routes = {
    splash: (context) => const SplashScreen(),
    login: (context) => const Placeholder(), // Replace with LoginScreen
    register: (context) => const Placeholder(), // Replace with RegisterScreen
    home: (context) => const Placeholder(), // Replace with HomeScreen
    result: (context) => const Placeholder(), // Replace with ResultScreen
    profile: (context) => const Placeholder(), // Replace with ProfileScreen
    subscription: (context) => const Placeholder(), // Replace with SubscriptionScreen
  };
}
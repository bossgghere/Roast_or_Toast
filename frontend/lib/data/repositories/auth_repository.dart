import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../core/constants/api_constants.dart';
import '../models/auth_response_model.dart';
import '../models/user_model.dart';

class AuthRepository {
  final _storage = const FlutterSecureStorage();
  
  // Register
  Future<AuthResponseModel> register({
    required String username,
    required String email,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.register}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'email': email,
          'password': password,
        }),
      );

      if (response.statusCode == 201) {
        final authResponse = AuthResponseModel.fromJson(jsonDecode(response.body));
        await _storage.write(key: 'token', value: authResponse.token);
        return authResponse;
      } else {
        throw Exception(jsonDecode(response.body)['message'] ?? 'Registration failed');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Login
  Future<AuthResponseModel> login({
    required String username,
    required String password,
  }) async {
    try {
      final response = await http.post(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.login}'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'username': username,
          'password': password,
        }),
      );

      if (response.statusCode == 200) {
        final authResponse = AuthResponseModel.fromJson(jsonDecode(response.body));
        await _storage.write(key: 'token', value: authResponse.token);
        return authResponse;
      } else {
        throw Exception(jsonDecode(response.body)['message'] ?? 'Login failed');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Get Me
  Future<UserModel> getMe() async {
    try {
      final token = await _storage.read(key: 'token');
      
      if (token == null) {
        throw Exception('No token found');
      }

      final response = await http.get(
        Uri.parse('${ApiConstants.baseUrl}${ApiConstants.getMe}'),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer $token',
        },
      );

      if (response.statusCode == 200) {
        return UserModel.fromJson(jsonDecode(response.body)['user']);
      } else {
        throw Exception('Failed to get user');
      }
    } catch (e) {
      throw Exception('Error: $e');
    }
  }

  // Logout
  Future<void> logout() async {
    await _storage.delete(key: 'token');
  }

  // Get Token
  Future<String?> getToken() async {
    return await _storage.read(key: 'token');
  }
}
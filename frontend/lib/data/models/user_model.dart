class UserModel {
  final String id;
  final String username;
  final String email;
  final bool isPro;
  final DateTime? subscriptionExpiry;
  final String? subscriptionPlan;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.isPro,
    this.subscriptionExpiry,
    this.subscriptionPlan,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'],
      username: json['username'],
      email: json['email'],
      isPro: json['isPro'] ?? false,
      subscriptionExpiry: json['subscriptionExpiry'] != null
          ? DateTime.parse(json['subscriptionExpiry'])
          : null,
      subscriptionPlan: json['subscriptionPlan'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'username': username,
      'email': email,
      'isPro': isPro,
      'subscriptionExpiry': subscriptionExpiry?.toIso8601String(),
      'subscriptionPlan': subscriptionPlan,
    };
  }
}
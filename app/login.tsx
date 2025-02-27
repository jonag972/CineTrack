import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { loginUser } from '../utils/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();

  const handleLogin = async () => {
    try {
      console.log('[LoginScreen] Attempting login with email:', email);
      setIsLoading(true);
      const response = await loginUser(email, password);
      
      console.log('[LoginScreen] Login response:', response);
      if (response.success) {
        console.log('[LoginScreen] Login successful, navigating to tabs');
        router.replace('/(tabs)');
      } else {
        console.log('[LoginScreen] Login failed:', response.message);
        Alert.alert('Erreur', response.message);
      }
    } catch (error) {
      console.error('[LoginScreen] Login error:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    console.log('[LoginScreen] Navigating to register screen');
    router.push('/register');
  };

  const handleContinueAsGuest = () => {
    console.log('[LoginScreen] Continuing as guest');
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Ionicons name="chevron-back" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      <View style={styles.content}>
        <ThemedText style={styles.title}>Connexion</ThemedText>
        <ThemedText style={styles.subtitle}>
          Connectez-vous pour accéder à vos collections et vos films préférés
        </ThemedText>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={22} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#8E8E93"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
            </View>

            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={22} color="#8E8E93" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Mot de passe"
                placeholderTextColor="#8E8E93"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoComplete="password"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.forgotPassword} onPress={() => router.push('/reset-password')}>
            <ThemedText style={styles.forgotPasswordText}>
              Mot de passe oublié ?
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleLogin}
            disabled={isLoading}
          >
            <ThemedText style={styles.submitButtonText}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Pas encore de compte ?{' '}
          </ThemedText>
          <TouchableOpacity onPress={() => router.push('/register')}>
            <ThemedText style={styles.footerLink}>S'inscrire</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 16,
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    padding: 4,
  },
  inputIcon: {
    marginHorizontal: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 17,
    padding: 12,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#0A84FF',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: '#0A84FF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#8E8E93',
    fontSize: 16,
  },
  footerLink: {
    color: '#0A84FF',
    fontSize: 16,
  },
});
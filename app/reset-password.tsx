import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Text, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export default function ResetPasswordScreen() {
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to verify if the email exists in the stored user data
  const verifyEmail = async (email: string) => {
    const usersJson = await AsyncStorage.getItem('@user_data');
    if (!usersJson) return false;
    
    const users = JSON.parse(usersJson);
    return users.some((user: any) => user.email === email);
  };

  // Function to handle the reset password process
  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer votre adresse email');
      return;
    }

    try {
      setIsLoading(true);
      const emailExists = await verifyEmail(email);

      if (emailExists) {
        setShowPasswordInput(true);
      } else {
        Alert.alert('Erreur', 'Aucun compte n\'existe avec cette adresse email');
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la vérification de l\'email');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle the change of password
  const handleChangePassword = async () => {
    if (!newPassword.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nouveau mot de passe');
      return;
    }

    try {
      setIsLoading(true);
      const usersJson = await AsyncStorage.getItem('@user_data');
      if (!usersJson) throw new Error('No users found');

      const users = JSON.parse(usersJson);
      const userIndex = users.findIndex((user: any) => user.email === email);

      if (userIndex === -1) throw new Error('User not found');

      // Hash the new password
      const salt = await Crypto.getRandomBytesAsync(16);
      const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
      const hash = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        newPassword + saltHex
      );
      const hashedPassword = `${saltHex}:${hash}`;

      // Update user's password
      users[userIndex].password = hashedPassword;
      await AsyncStorage.setItem('@user_data', JSON.stringify(users));

      Alert.alert(
        'Succès',
        'Votre mot de passe a été modifié avec succès',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors du changement de mot de passe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <BlurView intensity={100} style={styles.contentContainer}>
        <Text style={styles.title}>Mot de passe oublié</Text>
        
        <Text style={styles.description}>
          {showPasswordInput 
            ? 'Entrez votre nouveau mot de passe'
            : 'Entrez votre adresse email pour réinitialiser votre mot de passe'}
        </Text>

        {!showPasswordInput ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Vérification...' : 'Vérifier l\'email'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextInput
              style={styles.input}
              placeholder="Nouveau mot de passe"
              placeholderTextColor="#666"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleChangePassword}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Modification...' : 'Changer le mot de passe'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Retour à la connexion
          </Text>
        </TouchableOpacity>
      </BlurView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.8,
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    color: '#fff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
});

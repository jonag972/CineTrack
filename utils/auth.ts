import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as yup from 'yup';

// Validation schemas
export const loginSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis')
});

export const registerSchema = yup.object().shape({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .matches(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .matches(/[a-z]/, 'Le mot de passe doit contenir au moins une lettre minuscule')
    .matches(/[A-Z]/, 'Le mot de passe doit contenir au moins une lettre majuscule')
    .matches(/[^\w]/, 'Le mot de passe doit contenir au moins un caractère spécial')
    .required('Mot de passe requis'),
  nickname: yup.string().required('Surnom requis'),
  age: yup.number()
    .min(13, 'Vous devez avoir au moins 13 ans')
    .max(120, 'Age invalide')
    .required('Age requis')
});

// Types
export interface User {
  email: string;
  password: string;
  nickname: string;
  age: number;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
}

// Storage keys
const USER_KEY = '@user_data';
const AUTH_KEY = '@auth_status';

// Helper functions
const hashPassword = async (password: string): Promise<string> => {
  const salt = await Crypto.getRandomBytesAsync(16);
  const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
  const hash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + saltHex
  );
  return `${saltHex}:${hash}`;
};

const comparePassword = async (password: string, storedHash: string): Promise<boolean> => {
  const [saltHex, hash] = storedHash.split(':');
  const newHash = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    password + saltHex
  );
  return newHash === hash;
};

// Auth functions
export const registerUser = async (userData: User): Promise<AuthResponse> => {
  try {
    // Validate user data
    await registerSchema.validate(userData);

    // Check if user already exists
    const existingUsers = await AsyncStorage.getItem(USER_KEY);
    const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
    
    if (users.some(user => user.email === userData.email)) {
      return {
        success: false,
        message: 'Un compte existe déjà avec cet email'
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    const newUser = { ...userData, password: hashedPassword };

    // Save user
    users.push(newUser);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(users));

    // Set auth status
    await AsyncStorage.setItem(AUTH_KEY, 'true');

    const { password, ...userWithoutPassword } = newUser;
    return {
      success: true,
      message: 'Inscription réussie',
      user: userWithoutPassword
    };
  } catch (error) {
    console.log('Registration error:', error);
    if (error instanceof yup.ValidationError) {
      console.log('Validation error:', error.errors);
      return {
        success: false,
        message: error.errors[0]
      };
    }
    console.log('Unexpected error:', error);
    return {
      success: false,
      message: 'Une erreur inattendue est survenue'
    };
  }
};

export const loginUser = async (email: string, password: string): Promise<AuthResponse> => {
  try {
    // Validate login data
    await loginSchema.validate({ email, password });

    // Get users
    const existingUsers = await AsyncStorage.getItem(USER_KEY);
    const users: User[] = existingUsers ? JSON.parse(existingUsers) : [];
    
    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return {
        success: false,
        message: 'Email ou mot de passe incorrect'
      };
    }

    // Verify password
    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
      return {
        success: false,
        message: 'Email ou mot de passe incorrect'
      };
    }

    // Set auth status and current user
    await AsyncStorage.setItem(AUTH_KEY, 'true');
    await setCurrentUser(email);

    const { password: _, ...userWithoutPassword } = user;
    return {
      success: true,
      message: 'Connexion réussie',
      user: userWithoutPassword
    };
  } catch (error) {
    if (error instanceof yup.ValidationError) {
      return {
        success: false,
        message: error.message
      };
    }
    return {
      success: false,
      message: 'Une erreur est survenue lors de la connexion'
    };
  }
};

export const logoutUser = async (): Promise<void> => {
  await AsyncStorage.removeItem(AUTH_KEY);
};

export const checkAuthStatus = async (): Promise<boolean> => {
  const status = await AsyncStorage.getItem(AUTH_KEY);
  return status === 'true';
};

const CURRENT_USER_KEY = '@current_user';

// Feature authentication requirements
export const PROTECTED_FEATURES = {
  watchlist: true,
  profile: true,
  movieRating: true,
  favorites: true
};

export const requiresAuth = (feature: keyof typeof PROTECTED_FEATURES): boolean => {
  return PROTECTED_FEATURES[feature] || false;
};

export const getCurrentUser = async (): Promise<Omit<User, 'password'> | null> => {
  try {
    const authStatus = await AsyncStorage.getItem(AUTH_KEY);
    if (authStatus !== 'true') return null;

    const currentUserEmail = await AsyncStorage.getItem(CURRENT_USER_KEY);
    if (!currentUserEmail) return null;

    const existingUsers = await AsyncStorage.getItem(USER_KEY);
    if (!existingUsers) return null;

    const users: User[] = JSON.parse(existingUsers);
    const currentUser = users.find(user => user.email === currentUserEmail);
    
    if (!currentUser) return null;

    const { password, ...userWithoutPassword } = currentUser;
    return userWithoutPassword;
  } catch {
    return null;
  }
};

// Helper function to set current user
const setCurrentUser = async (email: string): Promise<void> => {
  await AsyncStorage.setItem(CURRENT_USER_KEY, email);
};
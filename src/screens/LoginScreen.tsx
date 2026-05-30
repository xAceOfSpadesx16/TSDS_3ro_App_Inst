import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const { login } = useAuth();
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = useCallback(async () => {
    setError('');

    if (!dni.trim() || !password.trim()) {
      setError('Completá todos los campos');
      return;
    }

    if (!/^\d{7,8}$/.test(dni.trim())) {
      setError('El DNI debe tener 7 u 8 dígitos');
      return;
    }

    setLoading(true);
    const success = await login(dni.trim(), password);
    setLoading(false);

    if (success) {
      onLoginSuccess();
    } else {
      setError('DNI o contraseña incorrectos');
    }
  }, [dni, password, login, onLoginSuccess]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.iconContainer}>
            <Text style={styles.iconText}>school</Text>
          </View>
          <Text style={styles.title}>Guía de aulas</Text>
          <Text style={styles.subtitle}>Hola! Ingresá tus datos para empezar.</Text>
          <Text style={styles.institution}>I.S.P.F. y T N° 28</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* DNI Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>DNI</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={dni}
                onChangeText={setDni}
                placeholder="Ingresá tu DNI"
                placeholderTextColor="#717786"
                keyboardType="numeric"
                maxLength={8}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Ingresá tu contraseña"
                placeholderTextColor="#717786"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Submit */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.buttonText}>Ingresar</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom gradient decoration */}
      <View style={styles.bottomGradient} pointerEvents="none" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fe',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  hero: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#d8e2ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 32,
    color: '#0058bc',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0058bc',
    letterSpacing: -0.02,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#1a1b1f',
    fontWeight: '400',
    lineHeight: 24,
  },
  institution: {
    fontSize: 12,
    color: '#414755',
    fontWeight: '500',
    fontStyle: 'italic',
    marginTop: 4,
  },
  form: {
    gap: 16,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1b1f',
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#c1c6d7',
    borderRadius: 12,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1a1b1f',
    fontWeight: '400',
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  eyeIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#ba1a1a',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  button: {
    backgroundColor: '#0058bc',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '25%',
    backgroundColor: 'rgba(216, 226, 255, 0.4)',
  },
});

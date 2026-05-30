import React, { useRef, useCallback, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { CameraView, BarcodeScanningResult, useCameraPermissions } from 'expo-camera';
import { StackNavigationProp } from '@react-navigation/stack';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { MockInstitutionRepository } from '../data/repositories/institution/MockInstitutionRepository';
import { RootStackParamList } from '../navigation/AppNavigator';

type CameraNavProp = StackNavigationProp<RootStackParamList, 'Camera'>;

interface CameraScreenProps {
  navigation: CameraNavProp;
}

const institutionRepository = new MockInstitutionRepository();

export default function CameraScreen({ navigation }: CameraScreenProps) {
  const { user, logout } = useAuth();
  const hasScanned = useRef(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      hasScanned.current = false;
      setShowError(false);
      setErrorMessage(null);
    });
    return unsubscribe;
  }, [navigation]);

  const handleBarcodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (hasScanned.current) return;
    hasScanned.current = true;

    const raw = result.data;
    const validation = await institutionRepository.validateEntryQR(raw);

    if (validation.valid) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      navigation.replace('SubjectList');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setErrorMessage(validation.error ?? 'Error desconocido');
      setShowError(true);
      setTimeout(() => {
        setShowError(false);
        setErrorMessage(null);
        hasScanned.current = false;
      }, 2000);
    }
  }, [navigation]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigation.replace('Login');
  }, [logout, navigation]);

  if (!permission) {
    // Camera permissions are still loading.
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    // Camera permissions are not granted yet.
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: 'white', marginBottom: 20 }}>Necesitamos permiso para usar la cámara</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={requestPermission}>
          <Text style={styles.logoutIcon}>Otorgar permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      />

      {/* Top overlay */}
      <View style={styles.topOverlay}>
        <View style={styles.topBar}>
          <Text style={styles.userName}>
            {user ? `${user.firstName} ${user.lastName}` : ''}
          </Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutIcon}>Salir</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Center scanner frame */}
      <View style={styles.centerOverlay}>
        <View style={styles.scannerFrame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
        </View>
      </View>

      {/* Bottom overlay */}
      <View style={styles.bottomOverlay}>
        <Text style={[styles.instructionText, showError && styles.errorTextStyle]}>
          {showError && errorMessage
            ? errorMessage
            : 'Apuntá la cámara al código QR del ingreso'}
        </Text>
      </View>
    </View>
  );
}

const SCAN_SIZE = 240;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  topOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 56,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  logoutIcon: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  centerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 5,
  },
  scannerFrame: {
    width: SCAN_SIZE,
    height: SCAN_SIZE,
    position: 'relative',
  },
  corner: {
    position: 'absolute',
    width: 36,
    height: 36,
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0058bc',
    borderTopLeftRadius: 12,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0058bc',
    borderTopRightRadius: 12,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#0058bc',
    borderBottomLeftRadius: 12,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#0058bc',
    borderBottomRightRadius: 12,
  },
  bottomOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 56,
    paddingTop: 20,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    zIndex: 10,
  },
  instructionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  errorTextStyle: {
    color: '#ff6b6b',
    fontWeight: '600',
  },
});

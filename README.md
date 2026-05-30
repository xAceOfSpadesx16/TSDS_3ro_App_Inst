# EduApp — Guía de Aulas

POC de app mobile para alumnos de un establecimiento educativo. Al ingresar, escanean un QR y ven la materia actual y las restantes del día.

## Stack

- **Expo SDK 56** con TypeScript strict
- **React Navigation v7** (Stack Navigator)
- **expo-camera** para escaneo QR
- **expo-haptics** para feedback táctil
- **Context API** para estado de autenticación

## Requisitos

- Node.js 18+
- Android Studio (para emulador) o dispositivo físico con depuración USB
- Para iOS: macOS con Xcode

## Instalación

```bash
cd edu-app
npm install
```

## Ejecución

Este proyecto requiere **expo-dev-client** (no funciona con Expo Go) debido al módulo de cámara nativo.

### Android
```bash
npx expo run:android
```

### iOS (solo macOS)
```bash
npx expo run:ios
```

## Estructura del proyecto

```
src/
├── data/
│   ├── models/          # User, Subject, ScheduleEntry, QRPayload
│   └── repositories/    # Interfaces + Mock implementations (Auth, Subject, Institution)
├── context/
│   └── AuthContext.tsx   # Estado global de autenticación
├── screens/
│   ├── LoginScreen.tsx      # Login por DNI + contraseña
│   ├── CameraScreen.tsx     # Escáner QR con overlay
│   └── SubjectListScreen.tsx # Materia actual + resto del día
├── navigation/
│   └── AppNavigator.tsx     # Stack Navigator con rutas protegidas
└── utils/
    └── scheduleUtils.ts     # Lógica de horarios (funciones puras)
```

## Datos de prueba

Ver `QR_TEST_DATA.md` para payloads de QR y credenciales de usuarios.

### Usuarios

| DNI | Nombre | Contraseña |
|---|---|---|
| 35123456 | Ana García | 1234 |
| 28654321 | Carlos Rodríguez | 1234 |
| 41987654 | María López | 1234 |

### Debug de horarios

Los horarios son nocturnos (18:00–23:00). Para testear durante el día, usar el modo debug:

```typescript
import { setDebugDate } from './src/data/repositories/subject/MockSubjectRepository';

// Simular lunes a las 19:00
setDebugDate(new Date(/* fecha lunes 19:00 */));

// Volver a hora real
setDebugDate(null);
```

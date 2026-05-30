import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';
import { MockSubjectRepository } from '../data/repositories/subject/MockSubjectRepository';
import { Subject } from '../data/models/Subject';
import {
  getCurrentSubject,
  getRemainingSubjectsForToday,
  getTodayScheduleEntry,
  formatTimeRange,
  subjectHasClassToday,
} from '../utils/scheduleUtils';
import { RootStackParamList } from '../navigation/AppNavigator';

type SubjectListNavProp = StackNavigationProp<RootStackParamList, 'SubjectList'>;

interface SubjectListScreenProps {
  navigation: SubjectListNavProp;
}

const subjectRepository = new MockSubjectRepository();

const DAYS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function SubjectListScreen({ navigation }: SubjectListScreenProps) {
  const { user, logout } = useAuth();
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [remainingSubjects, setRemainingSubjects] = useState<Subject[]>([]);
  const [hasSubjectsToday, setHasSubjectsToday] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const loadData = useCallback(async () => {
    if (!user) return;
    const now = new Date();
    const current = await subjectRepository.getCurrentSubject(user.dni, now);
    const remaining = await subjectRepository.getRemainingSubjectsForToday(user.dni, now);
    const allSubjects = await subjectRepository.getSubjectsByUserDni(user.dni);
    const hasToday = allSubjects.some(s => subjectHasClassToday(s, now));

    setCurrentSubject(current);
    setRemainingSubjects(remaining);
    setHasSubjectsToday(hasToday);
    setCurrentTime(now);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
      loadData();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleLogout = useCallback(async () => {
    await logout();
    navigation.replace('Login');
  }, [logout, navigation]);

  const handleRescan = useCallback(() => {
    navigation.replace('Camera');
  }, [navigation]);

  const formatLocation = (subject: Subject): string => {
    const parts = [`Piso ${subject.location.floor}`, `Aula ${subject.location.roomNumber}`];
    if (subject.location.additionalDetails) {
      parts.push(subject.location.additionalDetails);
    }
    return parts.join(' – ');
  };

  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(currentTime.getHours())}:${pad(currentTime.getMinutes())}`;
  const dayStr = DAYS[currentTime.getDay()];
  const dateStr = `${currentTime.getDate()} ${MONTHS[currentTime.getMonth()]}`;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Guía de aulas</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.headerRight}>
          <Text style={styles.logoutText}>Salir</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={false} onRefresh={loadData} />}
      >
        {/* User info card */}
        <View style={styles.userCard}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user ? `${user.firstName} ${user.lastName}` : ''}</Text>
            <Text style={styles.userSubtitle}>Alumno</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateCaps}>{dayStr.toUpperCase()}</Text>
            <Text style={styles.dateDay}>{dateStr}</Text>
          </View>
        </View>

        {/* Time display */}
        <View style={styles.timeRow}>
          <Text style={styles.timeLabel}>{`Hora Actual: ${timeStr}`}</Text>
        </View>

        {/* NOW section */}
        <Text style={styles.sectionLabel}>AHORA</Text>

        {currentSubject ? (
          <View style={[styles.currentCard, { borderLeftColor: currentSubject.color }]}>
            <View style={styles.currentCardHeader}>
              <Text style={styles.currentLabel}>CLASE EN CURSO</Text>
            </View>
            <Text style={styles.currentSubjectName}>{currentSubject.name}</Text>
            <Text style={styles.currentSchedule}>
              {(() => {
                const entry = getTodayScheduleEntry(currentSubject, currentTime);
                return entry ? formatTimeRange(entry) : '';
              })()}
            </Text>
            <Text style={styles.currentProfessor}>{currentSubject.professorName}</Text>
            <View style={styles.locationRow}>
              <Text style={styles.currentLocation}>{formatLocation(currentSubject)}</Text>
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>
              {hasSubjectsToday
                ? 'No tenés clases en este momento'
                : 'No tenés clases programadas para hoy'}
            </Text>
          </View>
        )}

        {/* REMAINDER section */}
        <Text style={styles.sectionLabel}>RESTO DE LA JORNADA</Text>

        {!hasSubjectsToday ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tenés clases programadas para hoy</Text>
          </View>
        ) : remainingSubjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tenés más materias por hoy</Text>
          </View>
        ) : (
          remainingSubjects.map(subject => {
            const entry = getTodayScheduleEntry(subject, currentTime);
            return (
              <View
                key={subject.id}
                style={[styles.subjectCard, { borderLeftColor: subject.color }]}
              >
                <Text style={styles.subjectName}>{subject.name}</Text>
                <Text style={styles.subjectSchedule}>
                  {entry ? formatTimeRange(entry) : ''}
                </Text>
                <Text style={styles.subjectProfessor}>{subject.professorName}</Text>
                <Text style={styles.subjectLocation}>{formatLocation(subject)}</Text>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Rescan FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleRescan} activeOpacity={0.8}>
        <Text style={styles.fabText}>Escanear</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#faf9fe',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 16,
    backgroundColor: '#faf9fe',
    borderBottomWidth: 1,
    borderBottomColor: '#c1c6d7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0058bc',
  },
  headerRight: {
    padding: 8,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ba1a1a',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c1c6d7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1b1f',
  },
  userSubtitle: {
    fontSize: 14,
    color: '#414755',
    marginTop: 2,
  },
  dateBox: {
    alignItems: 'flex-end',
  },
  dateCaps: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0058bc',
    letterSpacing: 0.05,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1b1f',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#717786',
    letterSpacing: 0.05,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#717786',
    letterSpacing: 0.05,
    textTransform: 'uppercase',
    marginTop: 16,
    marginBottom: 8,
  },
  currentCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c1c6d7',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 20,
    borderLeftWidth: 4,
  },
  currentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  currentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0058bc',
    letterSpacing: 0.05,
  },
  currentSubjectName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1b1f',
    lineHeight: 26,
  },
  currentSchedule: {
    fontSize: 14,
    color: '#414755',
    marginTop: 4,
  },
  currentProfessor: {
    fontSize: 14,
    color: '#414755',
    marginTop: 4,
  },
  locationRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#c1c6d7',
  },
  currentLocation: {
    fontSize: 14,
    color: '#717786',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c1c6d7',
    borderRadius: 12,
    padding: 16,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 14,
    color: '#717786',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  subjectCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#c1c6d7',
    borderRadius: 12,
    padding: 16,
    paddingLeft: 20,
    borderLeftWidth: 4,
    marginBottom: 12,
  },
  subjectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1a1b1f',
  },
  subjectSchedule: {
    fontSize: 14,
    color: '#414755',
    marginTop: 4,
  },
  subjectProfessor: {
    fontSize: 14,
    color: '#414755',
    marginTop: 2,
  },
  subjectLocation: {
    fontSize: 14,
    color: '#717786',
    marginTop: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#0058bc',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 24,
    shadowColor: '#0058bc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  fabText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

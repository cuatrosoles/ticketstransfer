/**
 * Selector visual de fecha y hora del evento (calendario + hora/minutos).
 */

import * as React from 'react';
import { useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import {
  formatEventDateTimeDisplay,
  parseDatetimeLocalValue,
  toDatetimeLocalValue,
} from '@tickets-transfer/shared';
import { colors, spacing, radius } from '../theme';

const WEEKDAYS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

function startOfDay(d: Date): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function buildCalendarCells(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1);
  const startPad = first.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function EventDateTimePicker({ value, onChange, placeholder }: Props) {
  const initial = parseDatetimeLocalValue(value) ?? new Date();
  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [selected, setSelected] = useState<Date>(initial);
  const [hour, setHour] = useState(initial.getHours());
  const [minute, setMinute] = useState(initial.getMinutes());

  const cells = useMemo(() => buildCalendarCells(viewYear, viewMonth), [viewYear, viewMonth]);
  const today = useMemo(() => startOfDay(new Date()), []);

  const openPicker = () => {
    const d = parseDatetimeLocalValue(value) ?? new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setSelected(d);
    setHour(d.getHours());
    setMinute(d.getMinutes());
    setOpen(true);
  };

  const confirm = () => {
    const d = new Date(selected);
    d.setHours(hour, minute, 0, 0);
    onChange(toDatetimeLocalValue(d));
    setOpen(false);
  };

  const shiftMonth = (delta: number) => {
    const d = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={openPicker} activeOpacity={0.85}>
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value ? formatEventDateTimeDisplay(value) : placeholder ?? 'Seleccionar fecha y hora'}
        </Text>
        <Text style={styles.triggerIcon}>📅</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.sheetTitle}>Fecha y hora del evento</Text>

            <View style={styles.monthRow}>
              <TouchableOpacity onPress={() => shiftMonth(-1)} style={styles.navBtn}>
                <Text style={styles.navBtnText}>‹</Text>
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity onPress={() => shiftMonth(1)} style={styles.navBtn}>
                <Text style={styles.navBtnText}>›</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAYS.map((w) => (
                <Text key={w} style={styles.weekday}>
                  {w}
                </Text>
              ))}
            </View>

            <View style={styles.grid}>
              {cells.map((cell, i) => {
                if (!cell) return <View key={`e-${i}`} style={styles.dayCell} />;
                const isSelected = sameDay(cell, selected);
                const isToday = sameDay(cell, today);
                return (
                  <TouchableOpacity
                    key={cell.toISOString()}
                    style={[styles.dayCell, isSelected && styles.daySelected, isToday && !isSelected && styles.dayToday]}
                    onPress={() => setSelected(cell)}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{cell.getDate()}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.timeLabel}>Hora</Text>
            <View style={styles.timeRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
                {hours.map((h) => (
                  <TouchableOpacity
                    key={`h-${h}`}
                    style={[styles.timeChip, hour === h && styles.timeChipActive]}
                    onPress={() => setHour(h)}
                  >
                    <Text style={[styles.timeChipText, hour === h && styles.timeChipTextActive]}>
                      {String(h).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.timeLabel}>Minutos</Text>
            <View style={styles.timeRow}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeScroll}>
                {minutes.map((m) => (
                  <TouchableOpacity
                    key={`m-${m}`}
                    style={[styles.timeChip, minute === m && styles.timeChipActive]}
                    onPress={() => setMinute(m)}
                  >
                    <Text style={[styles.timeChipText, minute === m && styles.timeChipTextActive]}>
                      {String(m).padStart(2, '0')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOpen(false)}>
                <Text style={styles.cancelBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.okBtn} onPress={confirm}>
                <Text style={styles.okBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    borderRadius: 20,
    padding: 14,
    marginBottom: spacing.md,
  },
  triggerText: { color: colors.text, fontSize: 15, flex: 1 },
  placeholder: { color: colors.textMuted },
  triggerIcon: { fontSize: 20, marginLeft: 8 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  sheet: {
    backgroundColor: '#0f172a',
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.35)',
    padding: spacing.lg,
    maxHeight: '90%',
  },
  sheetTitle: { color: colors.text, fontSize: 17, fontWeight: '700', marginBottom: spacing.md, textAlign: 'center' },
  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  monthLabel: { color: colors.text, fontSize: 16, fontWeight: '600' },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59,130,246,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnText: { color: colors.primaryLight, fontSize: 24, lineHeight: 28 },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekday: { flex: 1, textAlign: 'center', color: colors.textMuted, fontSize: 12, fontWeight: '600' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
  },
  daySelected: { backgroundColor: colors.primary, borderRadius: 999 },
  dayToday: { borderWidth: 1, borderColor: colors.primaryLight, borderRadius: 999 },
  dayText: { color: colors.text, fontSize: 14 },
  dayTextSelected: { color: colors.white, fontWeight: '700' },
  timeLabel: { color: colors.textMuted, fontSize: 13, fontWeight: '600', marginBottom: 6 },
  timeRow: { marginBottom: spacing.sm },
  timeScroll: { gap: 8, paddingVertical: 4 },
  timeChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    marginRight: 8,
  },
  timeChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  timeChipText: { color: colors.text, fontSize: 14 },
  timeChipTextActive: { color: colors.white, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    alignItems: 'center',
  },
  cancelBtnText: { color: colors.primaryLight, fontWeight: '600' },
  okBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius,
    backgroundColor: colors.primary,
    alignItems: 'center',
  },
  okBtnText: { color: colors.white, fontWeight: '700' },
});

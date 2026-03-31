/**
 * Mensajes – Historial de conversaciones y nueva sesión.
 * Mensajería interna entre usuarios (vendedor/comprador).
 * Requiere usuarios logueados.
 */

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import {
  getConversations,
  searchUsers,
  createOrGetConversation,
  updateProfile,
  type ConversationItem,
  type UserSearchItem,
} from '../lib/api';
import { requestNotificationPermission, getFcmToken } from '../lib/pushNotifications';
import { subscribeNewMessageHint } from '../lib/messageSync';
import { colors, spacing, radius, glassCard } from '../theme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Mensajes'>;

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 86400000) return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  if (diff < 604800000) return d.toLocaleDateString('es-AR', { weekday: 'short' });
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
}

function otherUserLabel(u: ConversationItem['otherUser'] | null | undefined): string {
  if (!u) return 'Usuario desconocido';
  if (u.username) return u.username;
  if (u.firstName || u.lastName) return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Usuario';
  return u.email || 'Sin email';
}

export function MensajesScreen() {
  const navigation = useNavigation<Nav>();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserSearchItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setError(null);
    try {
      const list = await getConversations();
      setConversations(Array.isArray(list) ? list.filter((c) => c != null && c.id) : []);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al cargar conversaciones';
      setError(msg);
      setConversations([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadConversations();
    }, [loadConversations])
  );

  useEffect(() => {
    return subscribeNewMessageHint(() => {
      void loadConversations();
    });
  }, [loadConversations]);

  useEffect(() => {
    requestNotificationPermission()
      .then((granted) => {
        if (granted) return getFcmToken();
        return null;
      })
      .then((token) => {
        if (token) return updateProfile({ fcmToken: token });
      })
      .catch(() => {
        // FCM es opcional: no mostrar error al usuario
      });
  }, []);

  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const users = await searchUsers(searchQuery.trim());
        setSearchResults(users);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const handleNewConversation = async (user: UserSearchItem) => {
    if (creating) return;
    setCreating(user.id);
    try {
      const conv = await createOrGetConversation(user.id);
      setModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      navigation.navigate('MensajesConversation', {
        conversationId: conv.id,
        otherUser: conv.otherUser,
      });
      loadConversations();
    } catch (e) {
      console.error(e);
    } finally {
      setCreating(null);
    }
  };

  const renderConversation = ({ item }: { item: ConversationItem }) => {
    const other = item?.otherUser;
    if (!item || !item.id || !other) return null;
    const initial = other.firstName?.[0] || other.email?.[0] || '?';
    return (
    <View style={styles.convCardWrap}>
      {item.hasUnread ? <View style={styles.unreadDot} /> : null}
      <TouchableOpacity
        style={[styles.convItem, glassCard]}
        onPress={() =>
          navigation.navigate('MensajesConversation', {
            conversationId: item.id,
            otherUser: {
              id: other.id,
              email: other.email,
              firstName: other.firstName,
              lastName: other.lastName,
              username: other.username,
              numeroId: other.numeroId,
              profileImageUrl: other.profileImageUrl,
            },
          })
        }
        activeOpacity={0.8}
      >
        <View style={styles.convAvatar}>
          <Text style={styles.convAvatarText}>
            {initial.toUpperCase()}
          </Text>
        </View>
        <View style={styles.convBody}>
          <Text style={styles.convName} numberOfLines={1}>
            {otherUserLabel(other)}
          </Text>
          <Text style={styles.convMeta} numberOfLines={1}>
            {other.numeroId ? `ID: ${other.numeroId}` : other.email || ''}
          </Text>
          {item.lastMessage && (
            <Text style={styles.convPreview} numberOfLines={1}>
              {item.lastMessage.isFromMe ? 'Vos: ' : ''}{item.lastMessage.content ?? ''}
            </Text>
          )}
        </View>
        <View style={styles.convRight}>
          <Text style={styles.convTime}>{formatTime(item.updatedAt ?? '')}</Text>
        </View>
      </TouchableOpacity>
    </View>
    );
  };

  const listHeader = (
    <>
      <ScreenHeader
        title="Mensajes"
        showBack
        onBack={() => navigation.goBack()}
        rightSlot={<UserMenuButton />}
      />
      <TouchableOpacity
        style={[styles.newBtn, glassCard]}
        onPress={() => setModalOpen(true)}
      >
        <Text style={styles.newBtnIcon}>+</Text>
        <Text style={styles.newBtnText}>Nueva conversación</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <AuthBackground>
      <View style={styles.container}>
        {loading && conversations.length === 0 ? (
          <View style={styles.containerLoading}>
            {listHeader}
            <View style={styles.centered}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          </View>
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(c) => c.id}
            renderItem={renderConversation}
            ListHeaderComponent={listHeader}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  loadConversations();
                }}
                tintColor={colors.primary}
              />
            }
            ListEmptyComponent={
              error ? (
                <View style={[styles.empty, glassCard]}>
                  <Text style={styles.emptyIcon}>⚠️</Text>
                  <Text style={styles.emptyTitle}>Error al cargar</Text>
                  <Text style={styles.emptyText}>{error}</Text>
                  <TouchableOpacity
                    style={styles.retryBtn}
                    onPress={() => {
                      setLoading(true);
                      loadConversations();
                    }}
                  >
                    <Text style={styles.retryBtnText}>Reintentar</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={[styles.empty, glassCard]}>
                  <Text style={styles.emptyIcon}>💬</Text>
                  <Text style={styles.emptyTitle}>Sin conversaciones</Text>
                  <Text style={styles.emptyText}>
                    Tocá "Nueva conversación" y buscá un usuario por ID o email para empezar a chatear.
                  </Text>
                </View>
              )
            }
          />
        )}
      </View>

      <Modal visible={modalOpen} transparent animationType="slide">
        <Pressable style={styles.modalOverlay} onPress={() => setModalOpen(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>Nueva conversación</Text>
            <Text style={styles.modalHint}>Buscá por ID, email o nombre de usuario</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="ID o email..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {searching && (
              <View style={styles.searching}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.searchingText}>Buscando...</Text>
              </View>
            )}
            {!searching && searchResults.length > 0 && (
              <FlatList
                data={searchResults}
                keyExtractor={(u) => u.id}
                style={styles.searchList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.searchItem}
                    onPress={() => handleNewConversation(item)}
                    disabled={creating === item.id}
                  >
                    <View style={styles.searchItemAvatar}>
                      <Text style={styles.searchItemAvatarText}>
                        {(item.firstName?.[0] || item.email[0] || '?').toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.searchItemBody}>
                      <Text style={styles.searchItemName}>
                        {item.username || [item.firstName, item.lastName].filter(Boolean).join(' ') || item.email}
                      </Text>
                      <Text style={styles.searchItemEmail}>{item.email}</Text>
                      {item.numeroId && (
                        <Text style={styles.searchItemId}>ID: {item.numeroId}</Text>
                      )}
                    </View>
                    {creating === item.id ? (
                      <ActivityIndicator size="small" color={colors.primary} />
                    ) : (
                      <Text style={styles.searchItemArrow}>→</Text>
                    )}
                  </TouchableOpacity>
                )}
              />
            )}
            {!searching && searchQuery.length >= 2 && searchResults.length === 0 && (
              <Text style={styles.noResults}>No se encontraron usuarios</Text>
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setModalOpen(false)}>
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: spacing.lg },
  containerLoading: { flex: 1, paddingHorizontal: spacing.lg },
  newBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: radius,
    gap: 10,
  },
  newBtnIcon: { fontSize: 24, color: colors.primaryLight, fontWeight: '600' },
  newBtnText: { fontSize: 16, color: colors.text, fontWeight: '600' },
  list: { paddingBottom: spacing.xl * 2 },
  convCardWrap: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  unreadDot: {
    position: 'absolute',
    top: 10,
    right: 14,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ffffff',
    zIndex: 2,
    borderWidth: 1,
    borderColor: 'rgba(15, 23, 42, 0.35)',
  },
  convItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius,
    gap: spacing.md,
  },
  convAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  convAvatarText: { fontSize: 18, color: colors.primaryLight, fontWeight: '700' },
  convBody: { flex: 1, minWidth: 0 },
  convName: { fontSize: 16, fontWeight: '600', color: colors.text },
  convMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  convPreview: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  convRight: { alignItems: 'flex-end', gap: 4 },
  convTime: { fontSize: 12, color: colors.textMuted },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: {
    flex: 1,
    marginTop: spacing.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: { fontSize: 48, marginBottom: spacing.md },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  emptyText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', lineHeight: 22 },
  retryBtn: {
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: colors.primary,
    borderRadius: radius,
  },
  retryBtnText: { color: colors.white, fontWeight: '600', fontSize: 15 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: 'rgba(15, 23, 42, 0.98)',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: spacing.lg,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  modalTitle: { fontSize: 20, fontWeight: '700', color: colors.text },
  modalHint: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: spacing.md },
  searchInput: {
    backgroundColor: 'rgba(30, 58, 138, 0.4)',
    borderRadius: 12,
    padding: 14,
    color: colors.text,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    marginBottom: spacing.md,
  },
  searching: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md },
  searchingText: { color: colors.textMuted, fontSize: 14 },
  searchList: { maxHeight: 280, marginBottom: spacing.md },
  searchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(96, 165, 250, 0.2)',
    gap: spacing.md,
  },
  searchItemAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(59, 130, 246, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchItemAvatarText: { fontSize: 16, color: colors.primaryLight, fontWeight: '600' },
  searchItemBody: { flex: 1, minWidth: 0 },
  searchItemName: { fontSize: 15, fontWeight: '600', color: colors.text },
  searchItemEmail: { fontSize: 12, color: colors.textMuted },
  searchItemId: { fontSize: 11, color: colors.primaryLight, marginTop: 2 },
  searchItemArrow: { fontSize: 18, color: colors.primaryLight },
  noResults: { color: colors.textMuted, textAlign: 'center', marginBottom: spacing.md },
  modalClose: {
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderRadius: radius,
  },
  modalCloseText: { color: colors.primaryLight, fontWeight: '600', fontSize: 16 },
});

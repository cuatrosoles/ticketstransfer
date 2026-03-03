/**
 * MensajesConversation – Chat entre dos usuarios.
 * Tiempo real vía polling. Diseño acorde al resto de la app.
 */

import * as React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../navigation/types';
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import {
  getConversationMessages,
  sendMessageToConversation,
  type MessageItem,
} from '../lib/api';
import { colors, spacing, radius, glassCard } from '../theme';

const POLL_INTERVAL_MS = 2500;

type Route = RouteProp<RootStackParamList, 'MensajesConversation'>;

function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

export function MensajesConversationScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const route = useRoute<Route>();
  const { conversationId, otherUser } = route.params;
  const title =
    otherUser?.username ||
    [otherUser?.firstName, otherUser?.lastName].filter(Boolean).join(' ') ||
    otherUser?.email ||
    'Conversación';
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const loadMessages = useCallback(async () => {
    try {
      const list = await getConversationMessages(conversationId);
      setMessages(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    const id = setInterval(loadMessages, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [loadMessages]);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;

    setInput('');
    setSending(true);
    try {
      const msg = await sendMessageToConversation(conversationId, trimmed);
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    } catch (e) {
      console.error(e);
      setInput(trimmed);
    } finally {
      setSending(false);
    }
  };

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView
            ref={scrollRef}
            style={styles.messagesScroll}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
            keyboardShouldPersistTaps="handled"
          >
            <ScreenHeader
              title={title}
              showBack
              onBack={() => navigation.goBack()}
              rightSlot={<UserMenuButton />}
            />
            {messages.map((msg) => (
              <View
                key={msg.id}
                style={[styles.messageRow, msg.isFromMe && styles.messageRowUser]}
              >
                <View
                  style={[styles.bubble, msg.isFromMe ? styles.bubbleUser : styles.bubbleOther]}
                >
                  <Text
                    selectable
                    style={[styles.bubbleText, msg.isFromMe && styles.bubbleTextUser]}
                  >
                    {msg.content}
                  </Text>
                  <Text
                    selectable
                    style={[
                      styles.bubbleTime,
                      msg.isFromMe ? styles.bubbleTimeUser : styles.bubbleTimeOther,
                    ]}
                  >
                    {formatMessageTime(msg.createdAt)}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        <View style={[styles.inputBar, glassCard, { paddingBottom: Math.max(insets.bottom, 8) + spacing.md }]}>
          <TextInput
            style={styles.input}
            placeholder="Escribí un mensaje..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={2000}
            editable={!sending}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || sending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messagesScroll: { flex: 1 },
  messagesContent: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: spacing.md,
    justifyContent: 'flex-start',
  },
  messageRowUser: { justifyContent: 'flex-end' },
  bubble: {
    maxWidth: '80%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: 'rgba(59, 130, 246, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 4,
  },
  bubbleOther: {
    backgroundColor: 'rgba(30, 58, 138, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
  },
  bubbleText: {
    fontSize: 15,
    color: colors.text,
    lineHeight: 22,
  },
  bubbleTextUser: { color: colors.white },
  bubbleTime: {
    fontSize: 11,
    marginTop: 4,
  },
  bubbleTimeUser: { color: 'rgba(255,255,255,0.8)' },
  bubbleTimeOther: { color: colors.textMuted },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 22,
    paddingHorizontal: 18,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.25)',
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 18, color: colors.white, fontWeight: '700' },
});

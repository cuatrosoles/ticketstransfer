/**
 * Chat Soporte – Chat-bot funcional con respuestas automáticas.
 * Temática: Tickets Transfer (publicar, comprar, KYC, pagos, disputas).
 * Arquitectura preparada para IA o servicios de terceros.
 */

import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { AuthBackground } from '../components/AuthBackground';
import { ScreenHeader } from '../components/ScreenHeader';
import { UserMenuButton } from '../components/UserMenuButton';
import { colors, spacing, radius, glassCard } from '../theme';
import { sendMessage, generateMessageId, type ChatMessage } from '../lib/chatService';

const WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome',
  text: '¡Hola! 👋 Soy el asistente de Tickets Transfer. ¿En qué puedo ayudarte hoy?',
  isUser: false,
  timestamp: Date.now(),
  quickReplies: ['¿Cómo publico un ticket?', '¿Cómo compro?', 'Verificación KYC', 'Ayuda general'],
};

export function ChatSoporteScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: generateMessageId(),
      text: trimmed,
      isUser: true,
      timestamp: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { reply, quickReplies } = await sendMessage(trimmed);
      const botMsg: ChatMessage = {
        id: generateMessageId(),
        text: reply,
        isUser: false,
        timestamp: Date.now(),
        quickReplies,
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      const errorMsg: ChatMessage = {
        id: generateMessageId(),
        text: 'Hubo un error. Por favor intentá de nuevo.',
        isUser: false,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  return (
    <AuthBackground>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.messagesScroll}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ScreenHeader
            title="Chat Soporte"
            showBack
            onBack={() => navigation.goBack()}
            rightSlot={<UserMenuButton />}
          />
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.isUser && styles.messageRowUser]}>
              <View style={[styles.bubble, msg.isUser ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={[styles.bubbleText, msg.isUser && styles.bubbleTextUser]}>
                  {msg.text}
                </Text>
                {!msg.isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
                  <View style={styles.quickReplies}>
                    {msg.quickReplies.map((qr) => (
                      <TouchableOpacity
                        key={qr}
                        style={styles.quickReplyChip}
                        onPress={() => handleQuickReply(qr)}
                        disabled={loading}
                      >
                        <Text style={styles.quickReplyText}>{qr}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}
          {loading && (
            <View style={styles.messageRow}>
              <View style={[styles.bubble, styles.bubbleBot, styles.typingBubble]}>
                <ActivityIndicator size="small" color={colors.primaryLight} />
                <Text style={styles.typingText}>Escribiendo...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputBar, glassCard, { paddingBottom: Math.max(insets.bottom, 8) + spacing.md }]}>
          <TextInput
            style={styles.input}
            placeholder="Escribí tu mensaje..."
            placeholderTextColor={colors.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSend(input)}
            returnKeyType="send"
            multiline
            maxLength={500}
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!input.trim() || loading) && styles.sendBtnDisabled]}
            onPress={() => handleSend(input)}
            disabled={!input.trim() || loading}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </AuthBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
    maxWidth: '85%',
    paddingVertical: 12,
    paddingHorizontal: 16,
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
  bubbleBot: {
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
  quickReplies: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  quickReplyChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: 'rgba(96, 165, 250, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  quickReplyText: {
    fontSize: 13,
    color: colors.primaryLight,
    fontWeight: '500',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typingText: {
    fontSize: 13,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
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
  sendBtnDisabled: {
    opacity: 0.4,
  },
  sendIcon: {
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
  },
});

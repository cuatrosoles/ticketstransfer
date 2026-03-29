/**
 * Mensajería interna - Firestore.
 * Push notifications al enviar mensaje.
 */

import { Router } from 'express';
import { FieldValue } from 'firebase-admin/firestore';
import { db, COLLECTIONS } from '../lib/firestore.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { sendPushNotification } from '../lib/firebase-messaging.js';

const router = Router();
router.use(requireAuth);

function normalizeUserIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

router.get('/conversations', async (req: AuthRequest, res) => {
  const userId = req.user!.id;

  const conv1 = await db()
    .collection(COLLECTIONS.CONVERSATIONS)
    .where('user1Id', '==', userId)
    .get();
  const conv2 = await db()
    .collection(COLLECTIONS.CONVERSATIONS)
    .where('user2Id', '==', userId)
    .get();

  const allConvs = [...conv1.docs, ...conv2.docs];
  const seen = new Set<string>();
  const uniqueConvs = allConvs.filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
  uniqueConvs.sort((a, b) => {
    const aTime = a.data().updatedAt?.toDate?.()?.getTime() ?? 0;
    const bTime = b.data().updatedAt?.toDate?.()?.getTime() ?? 0;
    return bTime - aTime;
  });

  const list = await Promise.all(
    uniqueConvs.slice(0, 50).map(async (doc) => {
      const c = doc.data();
      const otherId = c.user1Id === userId ? c.user2Id : c.user1Id;
      const otherDoc = await db().collection(COLLECTIONS.USERS).doc(otherId).get();
      const other = otherDoc.data();

      const lastMsgSnap = await db()
        .collection(COLLECTIONS.MESSAGES)
        .where('conversationId', '==', doc.id)
        .orderBy('createdAt', 'desc')
        .limit(1)
        .get();
      const lastMsg = lastMsgSnap.empty ? null : lastMsgSnap.docs[0].data();
      const isFromMe = lastMsg?.senderId === userId;
      const hasUnread = lastMsg && !isFromMe && !lastMsg.readAt;

      return {
        id: doc.id,
        otherUser: {
          id: otherId,
          email: other?.email,
          firstName: other?.firstName,
          lastName: other?.lastName,
          username: other?.username,
          numeroId: other?.numeroId,
          profileImageUrl: other?.profileImageUrl ?? null,
        },
        lastMessage: lastMsg
          ? {
              content: lastMsg.content,
              createdAt: lastMsg.createdAt?.toDate?.() ?? lastMsg.createdAt,
              isFromMe,
              readAt: lastMsg.readAt?.toDate?.() ?? lastMsg.readAt,
            }
          : null,
        hasUnread: !!hasUnread,
        updatedAt: c.updatedAt?.toDate?.() ?? c.updatedAt,
      };
    })
  );
  res.json(list);
});

router.get('/users/search', async (req: AuthRequest, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: 'Ingresá al menos 2 caracteres (ID o email)' });
    return;
  }
  const userId = req.user!.id;

  const byEmail = await db()
    .collection(COLLECTIONS.USERS)
    .where('email', '>=', q)
    .where('email', '<=', q + '\uf8ff')
    .limit(10)
    .get();
  const byUsername = await db()
    .collection(COLLECTIONS.USERS)
    .where('username', '>=', q)
    .where('username', '<=', q + '\uf8ff')
    .limit(10)
    .get();
  const byNumeroId = await db()
    .collection(COLLECTIONS.USERS)
    .where('numeroId', '>=', q)
    .where('numeroId', '<=', q + '\uf8ff')
    .limit(10)
    .get();

  const seen = new Set<string>();
  const users: Array<{ id: string; email: string; firstName?: string; lastName?: string; username?: string; numeroId?: string }> = [];
  for (const snap of [byEmail, byUsername, byNumeroId]) {
    for (const doc of snap.docs) {
      if (doc.id === userId || seen.has(doc.id)) continue;
      const d = doc.data();
      const match =
        (d.email || '').toLowerCase().includes(q.toLowerCase()) ||
        (d.username || '').toLowerCase().includes(q.toLowerCase()) ||
        (d.numeroId || '').toUpperCase().includes(q.toUpperCase());
      if (match) {
        seen.add(doc.id);
        users.push({
          id: doc.id,
          email: d.email,
          firstName: d.firstName,
          lastName: d.lastName,
          username: d.username,
          numeroId: d.numeroId,
        });
      }
      if (users.length >= 10) break;
    }
    if (users.length >= 10) break;
  }
  res.json(users.slice(0, 10));
});

router.post('/conversations', async (req: AuthRequest, res) => {
  const { otherUserId } = req.body;
  if (!otherUserId || typeof otherUserId !== 'string') {
    res.status(400).json({ error: 'otherUserId requerido' });
    return;
  }
  const userId = req.user!.id;
  if (otherUserId === userId) {
    res.status(400).json({ error: 'No podés iniciar conversación con vos mismo' });
    return;
  }

  const otherDoc = await db().collection(COLLECTIONS.USERS).doc(otherUserId).get();
  if (!otherDoc.exists) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }
  const other = otherDoc.data()!;

  const [u1, u2] = normalizeUserIds(userId, otherUserId);
  const existing = await db()
    .collection(COLLECTIONS.CONVERSATIONS)
    .where('user1Id', '==', u1)
    .where('user2Id', '==', u2)
    .limit(1)
    .get();

  let convId: string;
  let convData: FirebaseFirestore.DocumentData;

  if (!existing.empty) {
    convId = existing.docs[0].id;
    convData = existing.docs[0].data();
  } else {
    convId = db().collection(COLLECTIONS.CONVERSATIONS).doc().id;
    convData = {
      user1Id: u1,
      user2Id: u2,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).set(convData);
  }

  const otherId = convData.user1Id === userId ? u2 : u1;
  const otherUserData = other; // other ya es el documento del otro usuario (otherUserId)

  res.json({
    id: convId,
    otherUser: {
      id: otherId,
      email: otherUserData.email,
      firstName: otherUserData.firstName,
      lastName: otherUserData.lastName,
      username: otherUserData.username,
      numeroId: otherUserData.numeroId,
      profileImageUrl: otherUserData.profileImageUrl ?? null,
    },
    createdAt: convData.createdAt?.toDate?.() ?? convData.createdAt,
  });
});

router.get('/conversations/:id', async (req: AuthRequest, res) => {
  const convId = req.params.id;
  const userId = req.user!.id;
  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).get();
  if (!convDoc.exists) {
    res.status(404).json({ error: 'Conversación no encontrada' });
    return;
  }
  const conv = convDoc.data()!;
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: 'No tenés acceso a esta conversación' });
    return;
  }
  const otherId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
  const otherDoc = await db().collection(COLLECTIONS.USERS).doc(otherId).get();
  const other = otherDoc.data();
  res.json({
    id: convId,
    otherUser: {
      id: otherId,
      email: other?.email,
      firstName: other?.firstName,
      lastName: other?.lastName,
      username: other?.username,
      numeroId: other?.numeroId,
      profileImageUrl: other?.profileImageUrl ?? null,
    },
  });
});

router.get('/conversations/:id/messages', async (req: AuthRequest, res) => {
  const convId = req.params.id;
  const userId = req.user!.id;

  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).get();
  if (!convDoc.exists) {
    res.status(404).json({ error: 'Conversación no encontrada' });
    return;
  }
  const conv = convDoc.data()!;
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: 'No tenés acceso a esta conversación' });
    return;
  }

  const messagesSnap = await db()
    .collection(COLLECTIONS.MESSAGES)
    .where('conversationId', '==', convId)
    .orderBy('createdAt', 'asc')
    .get();

  await db()
    .collection(COLLECTIONS.MESSAGES)
    .where('conversationId', '==', convId)
    .where('senderId', '!=', userId)
    .get()
    .then((snap) => {
      const batch = db().batch();
      snap.docs.forEach((d) => {
        if (!d.data().readAt) batch.update(d.ref, { readAt: new Date() });
      });
      return batch.commit();
    })
    .catch(() => {});

  const messages = await Promise.all(
    messagesSnap.docs.map(async (doc) => {
      const m = doc.data();
      const senderDoc = await db().collection(COLLECTIONS.USERS).doc(m.senderId).get();
      const sender = senderDoc.data();
      return {
        id: doc.id,
        content: m.content,
        senderId: m.senderId,
        sender: sender ? { id: m.senderId, email: sender.email, firstName: sender.firstName, lastName: sender.lastName } : null,
        isFromMe: m.senderId === userId,
        createdAt: m.createdAt?.toDate?.() ?? m.createdAt,
      };
    })
  );
  res.json(messages);
});

router.post('/conversations/:id/messages', async (req: AuthRequest, res) => {
  const convId = req.params.id;
  const { content } = req.body;
  const userId = req.user!.id;

  if (!content || typeof content !== 'string' || !content.trim()) {
    res.status(400).json({ error: 'Mensaje requerido' });
    return;
  }
  if (content.length > 2000) {
    res.status(400).json({ error: 'Mensaje demasiado largo' });
    return;
  }

  const convDoc = await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).get();
  if (!convDoc.exists) {
    res.status(404).json({ error: 'Conversación no encontrada' });
    return;
  }
  const conv = convDoc.data()!;
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: 'No tenés acceso a esta conversación' });
    return;
  }

  const recipientId = conv.user1Id === userId ? conv.user2Id : conv.user1Id;
  const messageId = db().collection(COLLECTIONS.MESSAGES).doc().id;
  const messageData = {
    conversationId: convId,
    senderId: userId,
    content: content.trim(),
    createdAt: new Date(),
  };
  await db().collection(COLLECTIONS.MESSAGES).doc(messageId).set(messageData);
  await db().collection(COLLECTIONS.CONVERSATIONS).doc(convId).update({ updatedAt: new Date() });

  const senderDoc = await db().collection(COLLECTIONS.USERS).doc(userId).get();
  const sender = senderDoc.data();
  const recipientDoc = await db().collection(COLLECTIONS.USERS).doc(recipientId).get();
  const fcmToken = recipientDoc.data()?.fcmToken;
  if (fcmToken) {
    const senderName = [sender?.firstName, sender?.lastName].filter(Boolean).join(' ') || sender?.email || 'Alguien';
    const pushResult = await sendPushNotification(fcmToken, 'Nuevo mensaje', `${senderName}: ${content.trim().slice(0, 50)}`, {
      type: 'new_message',
      conversationId: convId,
    });
    if (pushResult.tokenInvalid) {
      await db().collection(COLLECTIONS.USERS).doc(recipientId).update({ fcmToken: FieldValue.delete() });
    }
  }

  res.status(201).json({
    id: messageId,
    content: messageData.content,
    senderId: userId,
    sender: sender ? { id: userId, email: sender.email, firstName: sender.firstName, lastName: sender.lastName } : null,
    isFromMe: true,
    createdAt: messageData.createdAt,
  });
});

export const messagesRouter = router;

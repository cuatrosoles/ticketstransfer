/**
 * Mensajería interna entre usuarios.
 * Requiere usuarios logueados. Admin puede monitorear.
 */

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

/** Normaliza IDs para que (A,B) y (B,A) sean la misma conversación */
function normalizeUserIds(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

/** Listar mis conversaciones (historial) */
router.get('/conversations', async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const conversations = await prisma.conversation.findMany({
    where: { OR: [{ user1Id: userId }, { user2Id: userId }] },
    include: {
      user1: { select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true } },
      user2: { select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: { content: true, createdAt: true, senderId: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const list = conversations.map((c) => {
    const other = c.user1Id === userId ? c.user2 : c.user1;
    const lastMsg = c.messages[0];
    return {
      id: c.id,
      otherUser: {
        id: other.id,
        email: other.email,
        firstName: other.firstName,
        lastName: other.lastName,
        username: other.username,
        numeroId: other.numeroId,
      },
      lastMessage: lastMsg
        ? { content: lastMsg.content, createdAt: lastMsg.createdAt, isFromMe: lastMsg.senderId === userId }
        : null,
      updatedAt: c.updatedAt,
    };
  });
  res.json(list);
});

/** Buscar usuario por ID o email para nueva conversación */
router.get('/users/search', async (req: AuthRequest, res) => {
  const q = (req.query.q as string)?.trim();
  if (!q || q.length < 2) {
    res.status(400).json({ error: 'Ingresá al menos 2 caracteres (ID o email)' });
    return;
  }
  const userId = req.user!.id;
  const users = await prisma.user.findMany({
    where: {
      id: { not: userId },
      OR: [
        { email: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
        { numeroId: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true },
    take: 10,
  });
  res.json(users);
});

/** Crear o obtener conversación con otro usuario */
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

  const other = await prisma.user.findUnique({
    where: { id: otherUserId },
    select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true },
  });
  if (!other) {
    res.status(404).json({ error: 'Usuario no encontrado' });
    return;
  }

  const [u1, u2] = normalizeUserIds(userId, otherUserId);
  let conv = await prisma.conversation.findUnique({
    where: { user1Id_user2Id: { user1Id: u1, user2Id: u2 } },
    include: {
      user1: { select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true } },
      user2: { select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true } },
    },
  });

  if (!conv) {
    conv = await prisma.conversation.create({
      data: { user1Id: u1, user2Id: u2 },
      include: {
        user1: { select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true } },
        user2: { select: { id: true, email: true, firstName: true, lastName: true, username: true, numeroId: true } },
      },
    });
  }

  const otherUser = conv.user1Id === userId ? conv.user2 : conv.user1;
  res.json({
    id: conv.id,
    otherUser,
    createdAt: conv.createdAt,
  });
});

/** Obtener mensajes de una conversación */
router.get('/conversations/:id/messages', async (req: AuthRequest, res) => {
  const convId = req.params.id;
  const userId = req.user!.id;
  const conv = await prisma.conversation.findUnique({
    where: { id: convId },
  });
  if (!conv) {
    res.status(404).json({ error: 'Conversación no encontrada' });
    return;
  }
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: 'No tenés acceso a esta conversación' });
    return;
  }

  const messages = await prisma.message.findMany({
    where: { conversationId: convId },
    include: { sender: { select: { id: true, email: true, firstName: true, lastName: true } } },
    orderBy: { createdAt: 'asc' },
  });

  res.json(
    messages.map((m) => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      sender: m.sender,
      isFromMe: m.senderId === userId,
      createdAt: m.createdAt,
    }))
  );
});

/** Enviar mensaje */
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

  const conv = await prisma.conversation.findUnique({
    where: { id: convId },
  });
  if (!conv) {
    res.status(404).json({ error: 'Conversación no encontrada' });
    return;
  }
  if (conv.user1Id !== userId && conv.user2Id !== userId) {
    res.status(403).json({ error: 'No tenés acceso a esta conversación' });
    return;
  }

  const message = await prisma.message.create({
    data: {
      conversationId: convId,
      senderId: userId,
      content: content.trim(),
    },
    include: { sender: { select: { id: true, email: true, firstName: true, lastName: true } } },
  });

  await prisma.conversation.update({
    where: { id: convId },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({
    id: message.id,
    content: message.content,
    senderId: message.senderId,
    sender: message.sender,
    isFromMe: true,
    createdAt: message.createdAt,
  });
});

export const messagesRouter = router;

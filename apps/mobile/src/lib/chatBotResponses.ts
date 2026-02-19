/**
 * Respuestas automáticas del chat-bot de soporte – Tickets Transfer.
 * Temática: venta/compra de tickets, KYC, pagos, disputas, verificación.
 * Diseñado para ser reemplazable por IA o API de terceros.
 */

export type ChatIntent =
  | 'saludo'
  | 'ayuda'
  | 'publicar'
  | 'comprar'
  | 'kyc'
  | 'verificacion'
  | 'pago'
  | 'disputa'
  | 'transferencia'
  | 'comision'
  | 'contacto'
  | 'despedida'
  | 'default';

export interface BotResponse {
  text: string;
  quickReplies?: string[];
}

const INTENT_PATTERNS: { intent: ChatIntent; patterns: RegExp[] }[] = [
  {
    intent: 'saludo',
    patterns: [
      /^hola\b/i,
      /^buenas\b/i,
      /^buenos\s*d[ií]as/i,
      /^buenas\s*tardes/i,
      /^buenas\s*noches/i,
      /^hey\b/i,
      /^hi\b/i,
      /^hello\b/i,
      /^qué\s*tal/i,
      /^cómo\s*estás/i,
      /^holi/i,
    ],
  },
  {
    intent: 'ayuda',
    patterns: [
      /ayuda/i,
      /necesito\s*ayuda/i,
      /soporte/i,
      /asistencia/i,
      /no\s*entiendo/i,
      /cómo\s*funciona/i,
      /explicame/i,
      /información/i,
    ],
  },
  {
    intent: 'publicar',
    patterns: [
      /publicar/i,
      /vender\s*ticket/i,
      /vender\s*entrada/i,
      /poner\s*en\s*venta/i,
      /publicar\s*ticket/i,
      /subir\s*ticket/i,
      /cómo\s*vendo/i,
      /vender/i,
    ],
  },
  {
    intent: 'comprar',
    patterns: [
      /comprar/i,
      /adquirir/i,
      /obtener\s*ticket/i,
      /buscar\s*ticket/i,
      /cómo\s*compro/i,
      /comprar\s*entrada/i,
    ],
  },
  {
    intent: 'kyc',
    patterns: [
      /kyc/i,
      /verificaci[oó]n\s*identidad/i,
      /verificar\s*dni/i,
      /documento/i,
      /selfie/i,
      /identidad/i,
      /didit/i,
    ],
  },
  {
    intent: 'verificacion',
    patterns: [
      /verificaci[oó]n/i,
      /verificar\s*ticket/i,
      /aprobado/i,
      /rechazado/i,
      /pendiente/i,
      /estado\s*del\s*ticket/i,
      /cuándo\s*aprueban/i,
    ],
  },
  {
    intent: 'pago',
    patterns: [
      /pago/i,
      /pag[oó]/i,
      /mercadopago/i,
      /tarjeta/i,
      /transferencia\s*bancaria/i,
      /cómo\s*pago/i,
      /método\s*pago/i,
      /formas\s*de\s*pago/i,
    ],
  },
  {
    intent: 'disputa',
    patterns: [
      /disputa/i,
      /problema/i,
      /reclamo/i,
      /no\s*recib[ií]/i,
      /estafa/i,
      /fraude/i,
      /cancelar/i,
      /devoluci[oó]n/i,
    ],
  },
  {
    intent: 'transferencia',
    patterns: [
      /transferir/i,
      /transferencia\s*del\s*ticket/i,
      /enviar\s*ticket/i,
      /cómo\s*transfiero/i,
      /pasar\s*ticket/i,
    ],
  },
  {
    intent: 'comision',
    patterns: [
      /comisi[oó]n/i,
      /porcentaje/i,
      /cuánto\s*cobra/i,
      /tarifa/i,
      /costo\s*plataforma/i,
    ],
  },
  {
    intent: 'contacto',
    patterns: [
      /contacto/i,
      /hablar\s*con\s*alguien/i,
      /persona\s*real/i,
      /agente/i,
      /email/i,
      /mail/i,
      /tel[eé]fono/i,
      /whatsapp/i,
    ],
  },
  {
    intent: 'despedida',
    patterns: [
      /^chau\b/i,
      /^adi[oó]s/i,
      /^gracias\s*chau/i,
      /^hasta\s*luego/i,
      /^bye\b/i,
      /^nos\s*vemos/i,
    ],
  },
];

const RESPONSES: Record<ChatIntent, BotResponse> = {
  saludo: {
    text: '¡Hola! 👋 Soy el asistente de Tickets Transfer. ¿En qué puedo ayudarte hoy?',
    quickReplies: ['¿Cómo publico un ticket?', '¿Cómo compro?', 'Verificación KYC', 'Ayuda general'],
  },
  ayuda: {
    text: 'En Tickets Transfer podés:\n\n• **Publicar tickets** para vender o intercambiar entradas\n• **Comprar tickets** de forma segura con verificación\n• **Verificar tu identidad** (KYC) para mayor confianza\n\n¿Qué te gustaría saber?',
    quickReplies: ['Publicar ticket', 'Comprar ticket', 'Verificación KYC'],
  },
  publicar: {
    text: 'Para **publicar un ticket**:\n\n1. Andá a "Publicar ticket" desde el inicio\n2. Completá los datos del evento (nombre, fecha, lugar, sector)\n3. Elegí la ticketera y app de boletos\n4. Subí la captura del ticket (QR) y de titularidad\n5. Definí el precio\n\nLa publicación pasa por verificación antes de estar disponible. ¿Alguna duda?',
    quickReplies: ['Verificación de publicaciones', 'Comisión por venta', 'Volver al inicio'],
  },
  comprar: {
    text: 'Para **comprar un ticket**:\n\n1. Andá a "Comprar Ticket"\n2. Buscá por ID del ticket o del vendedor\n3. Revisá los detalles y el precio\n4. Completá el pago (MercadoPago u otro método)\n5. El vendedor te transferirá el ticket una vez confirmado\n\nTodas las transacciones están protegidas. ¿Necesitás más info?',
    quickReplies: ['¿Cómo es el pago?', '¿Qué pasa si hay problemas?', 'Ayuda'],
  },
  kyc: {
    text: 'La **verificación KYC** (Know Your Customer) sirve para:\n\n• Dar más confianza a compradores y vendedores\n• Reducir fraudes\n• Cumplir con normativas\n\nNecesitás subir una foto de tu DNI y una selfie. Usamos Didit para el proceso. Podés iniciarla desde "Verificación KYC" en el inicio.',
    quickReplies: ['¿Cuánto tarda?', '¿Es obligatorio?', 'Problemas con KYC'],
  },
  verificacion: {
    text: 'Las publicaciones pasan por **verificación** para asegurar que los tickets sean legítimos:\n\n• Estado **Pendiente**: en revisión\n• **Aprobado**: ya está visible para comprar\n• **Rechazado**: te indicamos el motivo\n\nSuele tomar hasta 24-48 horas hábiles. ¿Tu publicación está demorada?',
    quickReplies: ['Mi ticket fue rechazado', '¿Cuánto tarda?', 'Otro tema'],
  },
  pago: {
    text: 'Los **pagos** en Tickets Transfer se realizan de forma segura:\n\n• Aceptamos **MercadoPago** y otros métodos\n• El dinero queda en custodia hasta que el comprador confirme la recepción del ticket\n• Hay una **comisión del 5%** por transacción para mantener la plataforma\n\n¿Tenés dudas sobre algún pago?',
    quickReplies: ['Comisión', 'Problemas con un pago', 'Devolución'],
  },
  disputa: {
    text: 'Si tenés un **problema o disputa**:\n\n1. Andá a "Mis compras" o "Mis ventas"\n2. Seleccioná la orden en cuestión\n3. Abrí una disputa explicando el motivo\n4. Nuestro equipo revisará el caso\n\nNo compartas datos sensibles por chat. Para casos urgentes, contactanos por los canales de Acerca de.',
    quickReplies: ['No recibí mi ticket', 'Quiero cancelar', 'Contactar soporte'],
  },
  transferencia: {
    text: 'La **transferencia del ticket** la hace el vendedor una vez que el pago está confirmado:\n\n• El comprador recibe el ticket en su app de boletos (Quentro, Enigma, etc.)\n• Debe confirmar la recepción para liberar el pago al vendedor\n• Si hay problemas, se puede abrir una disputa\n\n¿Algún inconveniente con una transferencia?',
    quickReplies: ['No recibí el ticket', '¿Cuánto tarda?', 'Ayuda'],
  },
  comision: {
    text: 'La **comisión** de Tickets Transfer es del **5%** sobre el precio de venta:\n\n• Se deduce del monto que recibe el vendedor\n• Ejemplo: ticket a $15.000 → vos recibís $14.250\n• Sirve para mantener la plataforma, verificación y soporte\n\n¿Otra consulta?',
    quickReplies: ['Entendido', 'Publicar ticket', 'Ayuda'],
  },
  contacto: {
    text: 'Para hablar con una **persona real** o temas urgentes:\n\n• Revisá la sección **"Acerca de"** para ver nuestros canales de contacto\n• Email, redes sociales y WhatsApp suelen estar disponibles\n• Este chat es para consultas frecuentes; para casos complejos te derivamos\n\n¿En qué más puedo ayudarte?',
    quickReplies: ['Acerca de', 'Volver al inicio', 'Gracias'],
  },
  despedida: {
    text: '¡Gracias por contactarnos! 🙌 Cualquier otra duda, estamos acá. ¡Que tengas buenos tickets!',
    quickReplies: [],
  },
  default: {
    text: 'No estoy seguro de entender. ¿Podrías ser más específico? Podés preguntar sobre:\n\n• Publicar o vender tickets\n• Comprar entradas\n• Verificación KYC\n• Pagos y comisiones\n• Disputas o problemas',
    quickReplies: ['Publicar ticket', 'Comprar ticket', 'Verificación KYC', 'Ayuda general'],
  },
};

export function matchIntent(message: string): ChatIntent {
  const trimmed = message.trim();
  if (!trimmed) return 'default';

  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(trimmed))) return intent;
  }
  return 'default';
}

export function getBotResponse(intent: ChatIntent): BotResponse {
  return RESPONSES[intent];
}

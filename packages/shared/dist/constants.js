/**
 * Constantes compartidas – Tickets Transfer (TT)
 * Ubicación: packages/shared/src/constants.ts
 */
export const APP_NAME = 'Tickets Transfer';
export const APP_SHORT_NAME = 'TT';
/** Ticketeras (UI: TICKETEK, allaccess, Ticketerà, TICKETERA – ids compatibles con API) */
export const TICKETERAS = [
    { id: 'TICKETEK', label: 'TICKETEK' },
    { id: 'ALLACCESS', label: 'allaccess' },
    { id: 'TICKETERA', label: 'Ticketerà' },
    { id: 'TICKET_PLUS', label: 'TICKETERA' },
];
export const TICKETERAS_IDS = ['TICKETEK', 'ALLACCESS', 'TICKETERA', 'TICKET_PLUS', 'OTRA'];
/** Apps de boletos digitales (Quentro, ENIGMA, T TICKET360, TICKETMAKER) */
export const APPS_BOLETOS = [
    { id: 'QUENTRO', label: 'Quentro' },
    { id: 'ENIGMA', label: 'ENIGMA' },
    { id: 'TICKET360', label: 'T TICKET360' },
    { id: 'TICKETMAKER', label: 'TICKETMAKER' },
];
export const APPS_BOLETOS_IDS = ['QUENTRO', 'ENIGMA', 'TICKET360', 'TICKETMAKER', 'OTRA'];
/** Acción del usuario: VENTA | INTERCAMBIO */
export const ACCION_FLUJO = ['VENTA', 'INTERCAMBIO'];
export const CATEGORIAS_EVENTOS = ['MUSICA', 'DEPORTES', 'TEATRO', 'FESTIVALES', 'OTRO'];
export const TIPO_ENTRADA = ['GENERAL', 'CAMPO', 'PLATEA', 'VIP', 'OTRO'];
/** Sexo según documento (Femenino, Masculino, X) */
export const SEXO_OPCIONES = [
    { value: 'FEM', label: 'Femenino' },
    { value: 'MASC', label: 'Masculino' },
    { value: 'X', label: 'X' },
];
export const KYC_STATUS = ['PENDIENTE', 'EN_REVISION', 'APROBADO', 'RECHAZADO'];
export const TICKET_LISTING_STATUS = [
    'BORRADOR', 'PENDIENTE_VERIFICACION', 'APROBADO', 'RECHAZADO',
    'DISPONIBLE', 'PAUSADO', 'VENDIDO', 'ELIMINADO',
];
export const ORDER_STATUS = [
    'PENDIENTE_PAGO', 'PAGADO', 'ESPERANDO_TRANSFERENCIA', 'TRANSFERIDO_VENDEDOR',
    'ESPERANDO_CONFIRMACION_COMPRADOR', 'EVIDENCIA_SUBIDA', 'VERIFICANDO',
    'COMPLETADA', 'CANCELADA', 'EN_DISPUTA',
    'DISPUTA_RESUELTA_COMPRADOR', 'DISPUTA_RESUELTA_VENDEDOR',
];
export const DISPUTE_STATUS = [
    'ABIERTA', 'EN_REVISION', 'ESPERANDO_INFO',
    'RESUELTA_FAVOR_COMPRADOR', 'RESUELTA_FAVOR_VENDEDOR',
];
export const TIPO_DOCUMENTO = ['DNI', 'LC', 'LE', 'PASAPORTE'];
export const PREFIJO_TELEFONO_DEFAULT = '+549';
export const HORAS_MAX_TRANSFERENCIA_VENDEDOR = 72;

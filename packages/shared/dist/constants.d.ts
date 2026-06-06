/**
 * Constantes compartidas – Tickets Transfer (TT)
 * Ubicación: packages/shared/src/constants.ts
 */
export declare const APP_NAME = "Tickets Transfer";
export declare const APP_SHORT_NAME = "TT";
/** Ticketeras (UI: TICKETEK, allaccess, Ticketerà, TICKETERA – ids compatibles con API) */
export declare const TICKETERAS: readonly [{
    readonly id: "TICKETEK";
    readonly label: "TICKETEK";
}, {
    readonly id: "ALLACCESS";
    readonly label: "allaccess";
}, {
    readonly id: "TICKETERA";
    readonly label: "Ticketerà";
}, {
    readonly id: "TICKET_PLUS";
    readonly label: "TICKETERA";
}];
export declare const TICKETERAS_IDS: readonly ["TICKETEK", "ALLACCESS", "TICKETERA", "TICKET_PLUS", "OTRA"];
/** Apps de boletos digitales (Quentro, ENIGMA, T TICKET360, TICKETMAKER) */
export declare const APPS_BOLETOS: readonly [{
    readonly id: "QUENTRO";
    readonly label: "Quentro";
}, {
    readonly id: "ENIGMA";
    readonly label: "ENIGMA";
}, {
    readonly id: "TICKET360";
    readonly label: "T TICKET360";
}, {
    readonly id: "TICKETMAKER";
    readonly label: "TICKETMAKER";
}];
export declare const APPS_BOLETOS_IDS: readonly ["QUENTRO", "ENIGMA", "TICKET360", "TICKETMAKER", "OTRA"];
/** Acción del usuario: VENTA | INTERCAMBIO */
export declare const ACCION_FLUJO: readonly ["VENTA", "INTERCAMBIO"];
export declare const CATEGORIAS_EVENTOS: readonly ["MUSICA", "DEPORTES", "TEATRO", "FESTIVALES", "OTRO"];
export declare const TIPO_ENTRADA: readonly ["GENERAL", "CAMPO", "PLATEA", "VIP", "OTRO"];
/** Sexo según documento (Femenino, Masculino, X) */
export declare const SEXO_OPCIONES: readonly [{
    readonly value: "FEM";
    readonly label: "Femenino";
}, {
    readonly value: "MASC";
    readonly label: "Masculino";
}, {
    readonly value: "X";
    readonly label: "X";
}];
export declare const KYC_STATUS: readonly ["PENDIENTE", "EN_REVISION", "APROBADO", "RECHAZADO"];
export declare const TICKET_LISTING_STATUS: readonly ["BORRADOR", "PENDIENTE_VERIFICACION", "APROBADO", "RECHAZADO", "DISPONIBLE", "PAUSADO", "VENDIDO", "ELIMINADO"];
export declare const ORDER_STATUS: readonly ["PENDIENTE_PAGO", "PAGADO", "ESPERANDO_TRANSFERENCIA", "TRANSFERIDO_VENDEDOR", "ESPERANDO_CONFIRMACION_COMPRADOR", "EVIDENCIA_SUBIDA", "VERIFICANDO", "COMPLETADA", "CANCELADA", "EN_DISPUTA", "DISPUTA_RESUELTA_COMPRADOR", "DISPUTA_RESUELTA_VENDEDOR"];
export declare const DISPUTE_STATUS: readonly ["ABIERTA", "EN_REVISION", "ESPERANDO_INFO", "RESUELTA_FAVOR_COMPRADOR", "RESUELTA_FAVOR_VENDEDOR"];
export declare const TIPO_DOCUMENTO: readonly ["DNI", "LC", "LE", "PASAPORTE"];
export declare const PREFIJO_TELEFONO_DEFAULT = "+549";
export declare const HORAS_MAX_TRANSFERENCIA_VENDEDOR = 72;
/** Minutos que un comprador tiene para concretar el pago antes de liberar el ticket */
export declare const MINUTOS_RESERVA_PAGO = 45;

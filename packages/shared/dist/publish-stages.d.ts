/**
 * Etapas mostradas durante la publicación de un ticket (UI de progreso).
 * El backend ejecuta un único POST; el avance se sincroniza por tiempo hasta la respuesta.
 */
export type PublishStage = {
    id: string;
    label: string;
    /** Peso relativo para el relleno del botón (suma ~100) */
    weight: number;
    /** Tiempo mínimo visible antes de pasar a la siguiente etapa (ms) */
    minMs: number;
};
export declare const PUBLISH_STAGES: PublishStage[];
export type PublishProgressUpdate = {
    progress: number;
    label: string;
    stageIndex: number;
};
/**
 * Ejecuta la petición de publicación mostrando etapas hasta completar o fallar.
 */
export declare function runWithPublishProgress<T>(run: () => Promise<T>, onProgress: (update: PublishProgressUpdate) => void): Promise<T>;

/**
 * Etapas mostradas durante la publicación de un ticket (UI de progreso).
 * El backend ejecuta un único POST; el avance se sincroniza por tiempo hasta la respuesta.
 */
export const PUBLISH_STAGES = [
    { id: 'start', label: 'Iniciando la creación del ticket', weight: 10, minMs: 400 },
    { id: 'validate', label: 'Validando campos', weight: 12, minMs: 700 },
    { id: 'upload', label: 'Subiendo capturas del ticket', weight: 18, minMs: 1200 },
    { id: 'images', label: 'Validando imágenes subidas', weight: 14, minMs: 900 },
    { id: 'redact', label: 'Procesando QR y datos sensibles', weight: 20, minMs: 1500 },
    { id: 'event-image', label: 'Creando imagen del evento', weight: 16, minMs: 1200 },
    { id: 'save', label: 'Guardando tu publicación', weight: 10, minMs: 600 },
];
/**
 * Ejecuta la petición de publicación mostrando etapas hasta completar o fallar.
 */
export async function runWithPublishProgress(run, onProgress) {
    let stageIndex = 0;
    let done = false;
    const totalWeight = PUBLISH_STAGES.reduce((s, st) => s + st.weight, 0);
    const emit = (index, cap = 92) => {
        const idx = Math.min(index, PUBLISH_STAGES.length - 1);
        const stage = PUBLISH_STAGES[idx];
        const doneWeight = PUBLISH_STAGES.slice(0, idx).reduce((s, st) => s + st.weight, 0);
        const progress = Math.min(cap, Math.round((doneWeight / totalWeight) * 100));
        onProgress({ progress, label: stage.label, stageIndex: idx });
    };
    emit(0);
    const advance = () => {
        if (done)
            return;
        if (stageIndex < PUBLISH_STAGES.length - 1) {
            stageIndex += 1;
            emit(stageIndex);
        }
    };
    const timers = [];
    let accumulated = 0;
    for (let i = 0; i < PUBLISH_STAGES.length - 1; i++) {
        accumulated += PUBLISH_STAGES[i].minMs;
        timers.push(setTimeout(() => advance(), accumulated));
    }
    try {
        const result = await run();
        done = true;
        timers.forEach(clearTimeout);
        onProgress({ progress: 100, label: 'Publicación completada', stageIndex: PUBLISH_STAGES.length - 1 });
        return result;
    }
    catch (e) {
        done = true;
        timers.forEach(clearTimeout);
        throw e;
    }
}

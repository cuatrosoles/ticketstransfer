/**
 * Al abrir cámara o galería (react-native-image-picker) la app suele pasar a
 * segundo plano. El bloqueo biométrico en AuthContext interpretaba eso como
 * “salida de la app” y desmontaba el Stack → se perdía el formulario de Publicar.
 *
 * Los lanzadores en imagePickerSafe activan esta bandera hasta que el callback
 * del picker termina.
 */
export const biometricLockBypassPickerOpenRef = { current: false };

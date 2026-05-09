/**
 * react-native-image-picker: ejecutar lógica (sobre todo async) fuera del callback nativo
 * evita en Hermes/Android: "No callback found for ImagePicker.launchImageLibrary — callback was already invoked".
 */
import { launchCamera, launchImageLibrary, type ImagePickerResponse } from 'react-native-image-picker';

type LibraryOptions = Parameters<typeof launchImageLibrary>[0];
type CameraOptions = Parameters<typeof launchCamera>[0];

function deferCallback(onResponse: (response: ImagePickerResponse) => void) {
  return (response: ImagePickerResponse) => {
    setTimeout(() => {
      onResponse(response);
    }, 0);
  };
}

export function launchImageLibrarySafe(
  options: LibraryOptions,
  onResponse: (response: ImagePickerResponse) => void
) {
  launchImageLibrary(options, deferCallback(onResponse));
}

export function launchCameraSafe(
  options: CameraOptions,
  onResponse: (response: ImagePickerResponse) => void
) {
  launchCamera(options, deferCallback(onResponse));
}

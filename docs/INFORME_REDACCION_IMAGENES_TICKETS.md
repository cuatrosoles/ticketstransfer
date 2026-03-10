# Informe: Redacción automática de imágenes en tickets

Objetivo: pixelar o difuminar zonas sensibles (código QR, nombres, domicilios, datos de tarjetas, etc.) en las imágenes que sube el vendedor al crear un ticket, manteniendo la veracidad sin exponer el contenido completo.

---

## Resumen ejecutivo

| Enfoque | Coste | Integración | Mejor para |
|--------|--------|-------------|------------|
| **Propio: OCR + regiones + Jimp/Sharp** | Gratis | Media | Control total, bajo coste |
| **Microsoft Presidio (imagen)** | Gratis (OSS) | Media-Alta | PII en texto detectado por OCR |
| **Canvas + jsQR (solo QR)** | Gratis | Baja | Solo ofuscar QR; resto manual |
| **APIs de pago (Bluur, Indora, etc.)** | Bajo–medio | Baja | Menos desarrollo, más coste |

Recomendación inicial: **solución híbrida en la API (Node)** con detección de QR + regiones predefinidas y pixelado con **Jimp** o **Sharp**, y opcionalmente Presidio si se quiere redactar también texto PII detectado por OCR.

---

## 1. Soluciones gratuitas / código abierto

### 1.1 Microsoft Presidio – Image Redactor

- **Qué hace:** Detecta texto en la imagen con **Tesseract OCR**, analiza PII (nombres, emails, números de tarjeta, etc.) y redacta con color/máscara.
- **URL:** https://microsoft.github.io/presidio/image-redactor/  
  Código: https://github.com/microsoft/presidio
- **Coste:** Gratis (open source).
- **Integración:** Servicio en **Python** (Docker o pip). Tu API Node podría llamar por HTTP al contenedor.
- **Pros:** Detección automática de PII en texto; soporta DICOM; bien documentado.
- **Contras:** En **beta**, no production-ready; stack Python + Tesseract; no detecta “zonas” como un QR por sí solo (solo texto).
- **Idoneidad:** Muy buena si priorizas **redactar texto sensible** (nombres, números) de forma automática. Para QR habría que combinar con otra detección.

---

### 1.2 Detección de QR + pixelado (jsQR + Canvas / Jimp)

- **Qué hace:** Localizar el código QR en la imagen y pixelar solo esa región (y opcionalmente otras zonas fijas que definas).
- **jsQR:** https://github.com/cozmo/jsQR  
  Devuelve la posición del QR en la imagen (bounding box).
- **Coste:** Gratis.
- **Integración:** 
  - **Front (web):** Canvas + `jsQR` para encontrar el QR y luego dibujar pixelado/blur en esa zona.
  - **Back (Node):** `jsQR` no es típico en Node; en servidor suele usarse **quirc** o **node-qrcode** para decodificar; para **solo pixelar una zona** sin decodificar, puedes usar **Jimp** o **Sharp** con coordenadas fijas o con un detector de QR en Node (p. ej. librerías que usen native bindings).
- **Pros:** Sin coste, control total sobre qué se pixela (QR + rectángulos fijos para “zona nombre”, “zona dirección” si son predefinidas).
- **Contras:** QR automático en Node requiere librerías adicionales; nombres/domicilios/tarjetas no se detectan solos salvo que añadas OCR (p. ej. Presidio o Tesseract).

---

### 1.3 Jimp (Node.js)

- **Qué hace:** Manipulación de imágenes en JavaScript: **pixelate**(tamaño, x, y, w, h) para regiones rectangulares.
- **URL:** https://github.com/jimp-dev/jimp | https://www.npmjs.com/package/jimp
- **Coste:** Gratis (MIT).
- **Integración:** En `apps/api` (Express), después de `multer`, leer el buffer con `Jimp.read()`, aplicar `pixelate()` a las regiones que quieras y subir el resultado a Firebase Storage.
- **Pros:** Sin dependencias nativas, API sencilla, regiones rectangulares fijas o calculadas (p. ej. desde jsQR en otro paso).
- **Contras:** Solo pixelado por coordenadas; no detecta PII ni QR por sí solo.

---

### 1.4 Sharp (Node.js)

- **Qué hace:** Redimensionar, recortar, blur, compositar; muy rápido (libvips).
- **URL:** https://sharp.pixelplumbing.com/
- **Coste:** Gratis (Apache 2.0).
- **Integración:** En la API, con `sharp(buffer).extract()` + blur o resize para simular pixelado y luego recomponer la imagen. Más eficiente que Jimp en imágenes grandes.
- **Pros:** Rendimiento y control fino; adecuado para pipeline de muchas imágenes.
- **Contras:** Dependencia nativa (libvips); la “detección” de qué pixelar sigue siendo tuya (coordenadas o otro servicio).

---

### 1.5 Canvas (navegador) + pixelado manual

- **Qué hace:** En el cliente (web), dibujar la imagen en un canvas, desactivar suavizado y redimensionar para pixelar, o aplicar `filter: blur()` a una región.
- **Referencia:** https://stackoverflow.com/questions/19129644/how-to-pixelate-an-image-with-canvas-and-javascript  
  Librería: https://github.com/miguelmota/pixelate
- **Coste:** Gratis.
- **Integración:** Útil si quieres que el **usuario** elija zonas a pixelar antes de subir; o combinar con jsQR en front para pixelar solo el QR y subir ya ofuscada.
- **Pros:** Todo en el cliente, sin enviar imagen sin ofuscar al servidor.
- **Contras:** No hay detección automática de nombres/domicilios/tarjetas; solo QR si usas jsQR y/o regiones que el usuario marque.

---

## 2. Servicios externos (APIs de pago / freemium)

### 2.1 Bluur

- **Qué hace:** Redacción con IA para texto e imágenes (caras, matrículas, PII).
- **URL / precios:** https://bluur.ai/pricing/  
  Prueba gratuita 7 días.
- **Integración:** API REST.
- **Idoneidad:** Si prefieres no desarrollar detección y asumir un coste recurrente.

---

### 2.2 Indora Labs

- **Qué hace:** Redacción de imágenes (caras, matrículas, metadatos).
- **Precio:** ~**0,05 USD por imagen** (redacción de imagen).
- **URL:** https://indoralabs.mintlify.app/api-reference/pricing
- **Idoneidad:** Bajo coste por uso; útil para volúmenes no muy altos.

---

### 2.3 Redaction API (redactionapi.net)

- **Qué hace:** Redacción de texto/PII (orientado a texto más que a “imagen completa”).
- **Precio:** desde **99 USD/mes** (plan Pro, 10M palabras).
- **URL:** https://www.redactionapi.net/pricing.php
- **Idoneidad:** Más orientado a documentos/texto que a fotos de tickets.

---

### 2.4 Code2Blur

- **Qué hace:** Redacción y anonimización en imagen y vídeo (IA).
- **Precio:** Prueba 30 días; on‑premise **2.900 USD/año**.
- **URL:** https://code2blur.com/
- **Idoneidad:** Empresas con presupuesto y necesidad de solución todo-en-uno.

---

### 2.5 PolyRedact

- **Qué hace:** API REST/SDK para redactar texto, imagen, documento, audio y vídeo; múltiples categorías de PII.
- **URL:** https://polyredact.com/product
- **Idoneidad:** Si buscas una API unificada para varios tipos de contenido (no solo imágenes de tickets).

---

## 3. Enfoque recomendado para Tickets Transfer

Tu flujo actual: **API Express** recibe `captureTicket` y `captureOwnership` (multer) y sube a **Firebase Storage**. Para no mostrar el ticket completo pero mantener veracidad:

1. **En la API (Node), después de recibir el archivo y antes de subir a Firebase:**
   - **Opción A – Solo QR y zonas fijas (más simple):**
     - Definir regiones por defecto (ej. “esquina superior derecha” para QR, rectángulos para nombre/dirección si los tickets son similares).
     - Usar **Jimp** (o Sharp) para `pixelate(size, x, y, w, h)` en esas regiones.
     - Opcional: en front (web) usar **jsQR** para detectar el QR y enviar coordenadas en la petición; la API solo pixelaría esas coordenadas + fijas.
   - **Opción B – Texto PII automático (más completo):**
     - Desplegar **Presidio Image Redactor** en Docker y llamarlo desde la API (envío de imagen, recepción de imagen redactada).
     - Para el QR: seguir con regiones fijas o con un detector de QR en servidor (p. ej. binding a una lib que use OpenCV/quirc) y pixelar con Jimp/Sharp.
   - **Opción C – Híbrido:**
     - Pixelado de QR y zonas fijas con **Jimp** en la API.
     - Si más adelante necesitas redactar también nombres/números en el texto de la imagen, añadir llamada a **Presidio** o a un OCR + regex sobre el texto extraído.

2. **Coste:**  
   - Jimp/Sharp + regiones/QR: **0 €**.  
   - Presidio: **0 €** (autohospedado).  
   - Servicios externos: según uso (p. ej. Indora ~0,05 USD/imagen).

3. **Orden sugerido de implementación:**
   - Fase 1: **Jimp** en la API con 1–2 regiones fijas (p. ej. cuadrante QR) y subida a Firebase.
   - Fase 2: Parámetros opcionales (coordenadas de QR o de zonas) desde el cliente usando jsQR o selección manual.
   - Fase 3 (opcional): Contenedor **Presidio Image Redactor** para redactar PII en texto detectado por OCR.

---

## 4. Referencias rápidas

| Recurso | URL |
|--------|-----|
| Presidio Image Redactor | https://microsoft.github.io/presidio/image-redactor/ |
| Presidio GitHub | https://github.com/microsoft/presidio |
| jsQR | https://github.com/cozmo/jsQR |
| Jimp | https://github.com/jimp-dev/jimp |
| Sharp | https://sharp.pixelplumbing.com/ |
| Pixelate (canvas) | https://github.com/miguelmota/pixelate |
| Bluur | https://bluur.ai/pricing/ |
| Indora Labs | https://indoralabs.mintlify.app/api-reference/pricing |
| Code2Blur | https://code2blur.com/ |
| PolyRedact | https://polyredact.com/product |
| Redaction API | https://www.redactionapi.net/pricing.php |

---

## 5. Estado de implementación (Fase 1 y Fase 2)

- **API (`apps/api`):** Implementado. Módulo `src/lib/image-redaction.ts` con Jimp: regiones fijas por defecto (QR, franjas de texto) y soporte de `pixelateRegions` en el body (normalizadas 0-1). La ruta `POST /tickets` redacta ambas imágenes antes de subir a Firebase Storage.
- **Web (`apps/web`):** Página **Publicar** (`/publicar`) con formulario completo y detección de QR con jsQR; envía `pixelateRegions` cuando se detecta el QR en la imagen del ticket.
- **Mobile:** Sin cambios; la API aplica regiones por defecto. Opcionalmente se puede enviar `pixelateRegions` en el FormData en el futuro (p. ej. si se añade detección de QR en la app).

*Documento generado para el proyecto Tickets Transfer. Implementación en `apps/api` (Node/Express) con Jimp; Fase 3 (Presidio) opcional y no implementada.*

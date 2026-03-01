/**
 * HTML del formulario de tarjeta (Mercado Pago Bricks).
 * Se carga embebido en WebView para evitar problemas de red, CSP y rutas.
 * API_BASE se inyecta para que fetch funcione correctamente.
 */
export function getCardFormHtml(apiBase: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agregar tarjeta</title>
  <script src="https://sdk.mercadopago.com/js/v2"></script>
  <style>
    * { box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 16px; background: #f5f5f5; }
    .container { max-width: 400px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    h1 { font-size: 18px; margin: 0 0 16px; color: #333; }
    #cardPaymentBrick_container { min-height: 200px; }
    .error { color: #c00; font-size: 14px; margin-top: 8px; }
    .hint { font-size: 12px; color: #666; margin-top: 8px; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Agregar tarjeta de crédito o débito</h1>
    <div id="cardPaymentBrick_container"></div>
    <p id="error" class="error" style="display:none"></p>
    <p class="hint">Los datos de tu tarjeta están protegidos. Nunca los almacenamos.</p>
  </div>
  <script>
    (async function() {
      const apiBase = '${apiBase.replace(/'/g, "\\'")}';
      const errEl = document.getElementById('error');
      function showErr(msg) {
        errEl.textContent = msg || 'Error desconocido';
        errEl.style.display = 'block';
      }
      let publicKey;
      try {
        const res = await fetch(apiBase + '/api/mercadopago/public-key');
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error al obtener configuración');
        publicKey = data.publicKey;
      } catch (e) {
        showErr(e.message || 'No se pudo cargar la configuración');
        return;
      }
      if (!window.MercadoPago) {
        showErr('SDK de Mercado Pago no cargó. Revisá tu conexión.');
        return;
      }
      try {
        const mp = new MercadoPago(publicKey, { locale: 'es-AR' });
        const bricksBuilder = mp.bricks();
        await bricksBuilder.create('cardPayment', 'cardPaymentBrick_container', {
          initialization: {
            amount: 100,
            payer: { email: 'test_payer_1@testuser.com' },
          },
          customization: {
            visual: { style: { theme: 'default' } },
            paymentMethods: {
              minInstallments: 1,
              maxInstallments: 1,
            },
          },
          callbacks: {
            onReady: () => {},
            onError: (err) => {
              showErr(err?.message || 'Error al procesar la tarjeta');
            },
            onSubmit: (formData) => {
              return new Promise((resolve, reject) => {
                const token = formData.token || formData.paymentMethod?.token || formData.payment_method?.token;
                if (token) {
                  const payload = { type: 'CARD_TOKEN', token, ...(formData.payment_method_id && { payment_method_id: formData.payment_method_id }) };
                  if (window.ReactNativeWebView) {
                    window.ReactNativeWebView.postMessage(JSON.stringify(payload));
                  } else if (window.parent !== window) {
                    window.parent.postMessage(payload, '*');
                  }
                  resolve();
                } else {
                  reject(new Error('No se generó el token'));
                }
              });
            },
          },
        });
      } catch (e) {
        showErr(e.message || 'Error al cargar el formulario de pago');
      }
    })();
  </script>
</body>
</html>`;
}

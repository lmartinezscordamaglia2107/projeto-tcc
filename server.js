import "dotenv/config";
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { MercadoPagoConfig, Preference } from "mercadopago";

const projectRoot = resolve(fileURLToPath(new URL(".", import.meta.url)));
const port = Number(process.env.PORT || 4173);
const requestLimit = 16 * 1024;
const rateLimitWindowMs = 60_000;
const rateLimitMax = 20;
const requestsByAddress = new Map();
const paymentCatalog = {
  "pace-short": { title: "Short Pace", price: 159, sizes: ["P", "M", "GG"] },
  "flow-set": { title: "Conjunto Flow", price: 289, sizes: ["P", "M", "G"] },
  "pulse-top": { title: "Top Pulse", price: 139, sizes: ["P", "M", "G", "GG"] },
  "terra-legging": { title: "Legging Terra", price: 229, sizes: ["P", "M", "G"] },
  "aero-tee": { title: "Camiseta Aero", price: 119, sizes: ["P", "M", "G", "GG"] },
  "street-jacket": { title: "Jaqueta Street", price: 319, sizes: ["M", "G", "GG"] },
  "stride-tight": { title: "Calça Stride", price: 199, sizes: ["P", "M", "G"] },
  "core-tank": { title: "Regata Core", price: 99, sizes: ["P", "M", "G", "GG"] }
};
const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  const contentLength = Number(request.headers["content-length"] || 0);
  if (contentLength > requestLimit) throw new Error("PAYLOAD_TOO_LARGE");
  let content = "";
  for await (const chunk of request) {
    content += chunk;
    if (Buffer.byteLength(content) > requestLimit) throw new Error("PAYLOAD_TOO_LARGE");
  }
  return JSON.parse(content || "{}");
}

function validateEmail(email) {
  return typeof email === "string" && email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateShippingAddress(address) {
  return address &&
    typeof address.street === "string" && address.street.trim().length > 0 && address.street.length <= 120 &&
    typeof address.number === "string" && /^\d{1,8}$/.test(address.number.trim()) && Number(address.number) > 0 &&
    typeof address.city === "string" && address.city.trim().length > 0 && address.city.length <= 80 &&
    typeof address.state === "string" && /^[A-Z]{2}$/.test(address.state) &&
    typeof address.postalCode === "string" && /^\d{5}-?\d{3}$/.test(address.postalCode);
}

function getPublicBaseUrl() {
  if (!process.env.APP_BASE_URL) return null;
  const baseUrl = new URL(process.env.APP_BASE_URL);
  if (baseUrl.protocol !== "https:" || ["localhost", "127.0.0.1", "::1"].includes(baseUrl.hostname)) {
    throw new Error("APP_BASE_URL must be a public HTTPS URL.");
  }
  return baseUrl.origin;
}

function checkRateLimit(request) {
  const address = request.socket.remoteAddress || "unknown";
  const now = Date.now();
  const recentRequests = (requestsByAddress.get(address) || []).filter((time) => now - time < rateLimitWindowMs);
  if (recentRequests.length >= rateLimitMax) return false;
  recentRequests.push(now);
  requestsByAddress.set(address, recentRequests);
  return true;
}

function createPreferenceItems(items, coupon) {
  if (!Array.isArray(items) || items.length === 0 || items.length > 20) {
    throw new Error("O carrinho deve conter de 1 a 20 produtos.");
  }

  return items.map((item) => {
    const product = paymentCatalog[item?.productId];
    const quantity = Number(item?.quantity);
    const size = String(item?.size || "");
    if (!product || !product.sizes.includes(size) || !Number.isInteger(quantity) || quantity < 1 || quantity > 10) {
      throw new Error("Há uma variação ou quantidade inválida no carrinho.");
    }
    const unitPrice = coupon === "VECTRA10" ? product.price * 0.9 : product.price;
    return {
      id: item.productId,
      title: `${product.title} - ${size}`,
      quantity,
      unit_price: Number(unitPrice.toFixed(2)),
      currency_id: "BRL"
    };
  });
}

async function createPaymentPreference(request, response) {
  if (!process.env.MP_ACCESS_TOKEN) {
    sendJson(response, 503, { error: "Checkout indisponível: configure MP_ACCESS_TOKEN no arquivo .env." });
    return;
  }
  const shippingCostValue = process.env.SHIPPING_COST_BRL?.trim() || "";
  const shippingCost = Number(shippingCostValue);
  if (!/^\d+(?:\.\d{1,2})?$/.test(shippingCostValue) || !Number.isFinite(shippingCost) || shippingCost < 0) {
    sendJson(response, 503, { error: "Checkout indisponível: configure SHIPPING_COST_BRL no arquivo .env." });
    return;
  }
  if (!checkRateLimit(request)) {
    sendJson(response, 429, { error: "Muitas tentativas. Aguarde um minuto e tente novamente." });
    return;
  }
  if (request.headers.origin && request.headers.origin !== "null") {
    try {
      if (new URL(request.headers.origin).host !== request.headers.host) {
        sendJson(response, 403, { error: "Origem da solicitação não permitida." });
        return;
      }
    } catch {
      sendJson(response, 403, { error: "Origem da solicitação inválida." });
      return;
    }
  }

  let payload;
  try {
    payload = await readJson(request);
  } catch (error) {
    const isLarge = error.message === "PAYLOAD_TOO_LARGE";
    sendJson(response, isLarge ? 413 : 400, { error: isLarge ? "Solicitação excede o limite permitido." : "Corpo JSON inválido." });
    return;
  }

  if (!validateEmail(payload.email) || !validateShippingAddress(payload.address)) {
    sendJson(response, 400, { error: "Informe um e-mail e um endereço de entrega válidos." });
    return;
  }
  if (typeof payload.firstName !== "string" || payload.firstName.trim().length < 1 || payload.firstName.length > 80 ||
      typeof payload.lastName !== "string" || payload.lastName.trim().length < 1 || payload.lastName.length > 80) {
    sendJson(response, 400, { error: "Informe seu nome e sobrenome." });
    return;
  }

  let items;
  let baseUrl;
  try {
    items = createPreferenceItems(payload.items, payload.coupon);
    baseUrl = getPublicBaseUrl();
  } catch (error) {
    sendJson(response, 400, { error: error.message });
    return;
  }

  const preferenceBody = {
    items,
    payer: {
      name: payload.firstName.trim(),
      surname: payload.lastName.trim(),
      email: payload.email.trim(),
      address: {
        zip_code: payload.address.postalCode.replace("-", ""),
        street_name: payload.address.street.trim(),
        street_number: Number(payload.address.number)
      }
    },
    shipments: {
      cost: shippingCost,
      mode: "not_specified",
      receiver_address: {
        zip_code: payload.address.postalCode.replace("-", ""),
        street_name: payload.address.street.trim(),
        street_number: Number(payload.address.number),
        city_name: payload.address.city.trim(),
        state_name: payload.address.state,
        country_name: "Brasil"
      }
    },
    external_reference: `vectra-${randomUUID()}`,
    statement_descriptor: "VECTRA SPORT"
  };
  if (baseUrl) {
    preferenceBody.back_urls = {
      success: `${baseUrl}/?payment=success`,
      pending: `${baseUrl}/?payment=pending`,
      failure: `${baseUrl}/?payment=failure`
    };
    preferenceBody.auto_return = "approved";
  }
  try {
    const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN, options: { timeout: 8000 } });
    const preference = new Preference(client);
    const result = await preference.create({
      body: preferenceBody,
      requestOptions: { idempotencyKey: randomUUID() }
    });
    const checkoutUrl = process.env.MP_ACCESS_TOKEN.startsWith("TEST-")
      ? result.sandbox_init_point || result.init_point
      : result.init_point;
    if (!checkoutUrl) throw new Error("Mercado Pago did not return a checkout URL.");
    sendJson(response, 201, { initPoint: checkoutUrl });
  } catch (error) {
    console.error("Mercado Pago preference creation failed:", error.message);
    sendJson(response, 502, { error: "Não foi possível iniciar o pagamento. Verifique suas credenciais e tente novamente." });
  }
}

async function serveStatic(pathname, response) {
  const requestedPath = pathname === "/" ? "/index.html" : decodeURIComponent(pathname);
  const filePath = resolve(projectRoot, `.${requestedPath}`);
  if (!filePath.startsWith(`${projectRoot}${sep}`) && filePath !== projectRoot) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const fileInfo = await stat(filePath);
    if (!fileInfo.isFile()) throw new Error("Not a file");
    const content = await readFile(filePath);
    response.writeHead(200, { "content-type": mimeTypes[extname(filePath)] || "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = createServer(async (request, response) => {
  let requestUrl;
  try {
    requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  } catch {
    sendJson(response, 400, { error: "URL inválida." });
    return;
  }

  if (requestUrl.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { status: "ok", paymentConfigured: Boolean(process.env.MP_ACCESS_TOKEN) });
    return;
  }
  if (requestUrl.pathname === "/api/payments/preference" && request.method === "POST") {
    await createPaymentPreference(request, response);
    return;
  }
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.writeHead(405, { allow: "GET, HEAD, POST" });
    response.end("Method not allowed");
    return;
  }
  if (request.method === "HEAD") {
    response.writeHead(200);
    response.end();
    return;
  }
  await serveStatic(requestUrl.pathname, response);
});

server.listen(port, () => {
  console.log(`Vectra Sport running at http://localhost:${port}`);
  if (!process.env.MP_ACCESS_TOKEN) console.log("Payment checkout is disabled until MP_ACCESS_TOKEN is configured in .env.");
});

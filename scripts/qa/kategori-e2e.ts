/**
 * Bize-sat sözleşme testi: mobile'ın gerçek form yapılandırması ve doğrulama mantığıyla
 * HER kategoriyi bir web backend'ine gönderir ve veritabanında doğrular
 * (alan kaybı, kategori/marka/model, istemci doğrulaması). Arayüz çalıştırılmaz.
 *
 * !!! YALNIZCA İZOLE ortamda çalıştırın — gerçek kayıt yazar. Prod/paylaşılan DB'ye ASLA.
 *   1) web: MONGODB_URI=mongodb://127.0.0.1:27099/izole-test (bellekte Mongo, mongodb-memory-server)
 *      GMAIL_USER/GMAIL_APP_PASSWORD/BLOB_READ_WRITE_TOKEN sahte; `npx tsx scripts/seed-e2e.js`
 *      ile test kullanıcıları; `npx next dev -p 3111`
 *   2) WEB_DIR=../dusukbutce-web npx tsx scripts/qa/kategori-e2e.ts
 * Rate limit'i aşmamak için her istek farklı x-forwarded-for gönderir.
 */
import { createRequire } from "node:module";
import { CATEGORY_FORM_CONFIGS } from "../../src/features/submissions/config/categoryFormConfigs";
import {
  getMissingFields,
  hasOwnModelField,
} from "../../src/features/submissions/validation";

const WEB_DIR = process.env.WEB_DIR ?? "../dusukbutce-web";
const BASE = process.env.API_BASE_URL ?? "http://localhost:3111";
const MONGO_URI =
  process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27099/izole-test";
if (!/^mongodb:\/\/(127\.0\.0\.1|localhost)/.test(MONGO_URI)) {
  throw new Error(
    "Güvenlik: yalnızca yerel/izole MongoDB kabul edilir: " + MONGO_URI,
  );
}
if (!/^https?:\/\/(localhost|127\.0\.0\.1)/.test(BASE)) {
  throw new Error("Güvenlik: yalnızca yerel API adresi kabul edilir: " + BASE);
}
const require = createRequire(`${process.cwd()}/${WEB_DIR}/package.json`);
const mongoose = require("mongoose");
let ipCounter = 10;
const ip = () => `10.99.0.${ipCounter++}`;

async function login(): Promise<string> {
  const csrfRes = await fetch(`${BASE}/api/auth/csrf-token`);
  const csrf = (await csrfRes.json()).csrfToken;
  const cookie = csrfRes.headers
    .getSetCookie()
    .map((c) => c.split(";")[0])
    .join("; ");
  const res = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": ip(),
      Cookie: cookie,
    },
    body: JSON.stringify({
      email: "test@example.com",
      password: "password123",
      csrfToken: csrf,
    }),
  });
  const json: any = await res.json();
  if (!json.token)
    throw new Error("giriş başarısız: " + JSON.stringify(json).slice(0, 120));
  return json.token;
}

(async () => {
  const token = await login();
  await mongoose.connection.openUri(MONGO_URI);
  const col = mongoose.connection.db.collection("productsubmissions");
  const rows: string[] = [];
  let fail = 0;

  for (const config of CATEGORY_FORM_CONFIGS) {
    // Kullanıcının formda yapacağı seçimler: ilk seçenek / 'x' / '1'
    const extraValues: Record<string, unknown> = {};
    for (const f of config.extraFields) {
      if (f.type === "select") extraValues[f.key] = f.options![0];
      else if (f.type === "boolean") extraValues[f.key] = true;
      else extraValues[f.key] = f.keyboardType === "numeric" ? "1" : "x";
    }
    const brand = config.fixedBrand ? "" : `Marka-${config.id}`;
    const model = hasOwnModelField(config) ? "" : `Model-${config.id}`;
    const missing = getMissingFields(config, {
      brand,
      model,
      cosmeticCondition: "İyi",
      extraValues,
    });
    if (missing.length) {
      rows.push(
        `✗ ${config.id.padEnd(18)} istemci doğrulaması geçemedi: ${missing.join(", ")}`,
      );
      fail++;
      continue;
    }

    // SubmissionFormScreen.onSubmit ile aynı yük
    const payload = {
      brand: config.fixedBrand ?? brand.trim(),
      model: hasOwnModelField(config)
        ? String(extraValues.model).trim()
        : model.trim(),
      cosmeticCondition: "İyi",
      description: "",
      hasWarranty: false,
      warrantyDuration: undefined,
      hasBox: false,
      hasInvoice: false,
      invoiceDate: undefined,
      images: [],
      quantity: 1,
      ...extraValues,
      category: config.id,
    };
    const res = await fetch(`${BASE}${config.endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "x-forwarded-for": ip(),
      },
      body: JSON.stringify(payload),
    });
    const body: any = await res.json().catch(() => ({}));
    if (res.status !== 200 && res.status !== 201) {
      rows.push(
        `✗ ${config.id.padEnd(18)} HTTP ${res.status} ${JSON.stringify(body).slice(0, 90)}`,
      );
      fail++;
      continue;
    }
    const num = body.submissionNumber;
    const doc: any = await col.findOne({ submissionNumber: num });
    const dropped = Object.keys(extraValues).filter(
      (k) =>
        doc?.[k] !== extraValues[k] && !(typeof extraValues[k] === "boolean"),
    );
    const catOk = doc?.category === config.id;
    const brandOk =
      doc?.brand === payload.brand && doc?.model === payload.model;
    if (dropped.length || !catOk || !brandOk) {
      rows.push(
        `✗ ${config.id.padEnd(18)} ${num} kayıp alan: [${dropped.join(", ")}]${catOk ? "" : " kategori≠"}${brandOk ? "" : " marka/model≠"}`,
      );
      fail++;
    } else {
      rows.push(
        `✓ ${config.id.padEnd(18)} ${num} ${config.extraFields.length} alan kaydedildi → ${config.endpoint}`,
      );
    }
  }
  console.log(rows.join("\n"));
  console.log(
    `\nSONUÇ: ${CATEGORY_FORM_CONFIGS.length - fail}/${CATEGORY_FORM_CONFIGS.length} kategori başarılı`,
  );
  process.exit(fail ? 1 : 0);
})();

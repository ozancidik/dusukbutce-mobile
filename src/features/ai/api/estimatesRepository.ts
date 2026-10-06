import { apiClient } from "../../../core/network/apiClient";
import { endpoints } from "../../../core/network/endpoints";
import { ApiException } from "../../../core/network/apiException";

// Fiyat Danışmanı ve Tamir Tahmini web backend'indeki /api/ai/estimate üzerinden çalışır.
// (Eskiden Perplexity Node SDK'sı ve API anahtarı doğrudan uygulamada duruyordu:
// SDK React Native'de paketlenemiyordu ve anahtar uygulamaya gömülüyordu.)
export interface EstimateAnswer {
  answer: string;
  sources: { title?: string; url?: string }[];
  status: "success" | "error";
  error?: string;
}

async function request(
  payload: Record<string, string>,
): Promise<EstimateAnswer> {
  try {
    const res = await apiClient.post(endpoints.aiEstimate, payload);
    const data = res.data?.data as
      { answer?: unknown; sources?: unknown } | undefined;
    const answer = typeof data?.answer === "string" ? data.answer.trim() : "";
    if (!answer) {
      return {
        answer: "Tahmin servisinden geçerli bir yanıt alınamadı.",
        sources: [],
        status: "error",
      };
    }
    const sources = Array.isArray(data?.sources)
      ? (data.sources as { url?: string }[])
      : [];
    return { answer, sources, status: "success" };
  } catch (e) {
    // Backend'in Türkçe mesajı (429 çok fazla deneme, 503 kullanılamıyor, 502 ulaşılamadı)
    // doğrudan ekrandaki hata kartında gösterilir.
    const message = ApiException.fromAxiosError(e).message;
    return { answer: message, sources: [], status: "error", error: message };
  }
}

export const estimatesRepository = {
  priceEstimate(product: string): Promise<EstimateAnswer> {
    return request({ kind: "price", product });
  },

  repairEstimate(device: string, issue: string): Promise<EstimateAnswer> {
    return request({ kind: "repair", device, issue });
  },
};

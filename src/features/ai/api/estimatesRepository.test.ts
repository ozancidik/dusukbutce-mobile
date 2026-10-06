import { AxiosError, AxiosHeaders } from "axios";

jest.mock("../../../core/network/apiClient", () => ({
  apiClient: { post: jest.fn() },
}));

import { apiClient } from "../../../core/network/apiClient";
import { estimatesRepository } from "./estimatesRepository";

const post = apiClient.post as jest.Mock;

function axiosError(status: number, message: string) {
  return new AxiosError("hata", String(status), undefined, undefined, {
    status,
    statusText: "",
    headers: {},
    config: { headers: new AxiosHeaders() },
    data: { message },
  });
}

beforeEach(() => post.mockReset());

describe("estimatesRepository", () => {
  it("fiyat: doğru uca doğru gövdeyle gider ve yanıtı eşler", async () => {
    post.mockResolvedValue({
      data: {
        success: true,
        data: {
          answer: " Ortalama 20.000 TL ",
          sources: [{ url: "https://a.com" }],
        },
      },
    });
    const res = await estimatesRepository.priceEstimate("iPhone 13");
    expect(post).toHaveBeenCalledWith("/api/ai/estimate", {
      kind: "price",
      product: "iPhone 13",
    });
    expect(res).toEqual({
      answer: "Ortalama 20.000 TL",
      sources: [{ url: "https://a.com" }],
      status: "success",
    });
  });

  it("tamir: cihaz ve arıza gönderilir", async () => {
    post.mockResolvedValue({
      data: { data: { answer: "Yaklaşık 3.000 TL", sources: [] } },
    });
    await estimatesRepository.repairEstimate("MacBook Air", "ekran kırık");
    expect(post).toHaveBeenCalledWith("/api/ai/estimate", {
      kind: "repair",
      device: "MacBook Air",
      issue: "ekran kırık",
    });
  });

  it("kaynaklar dizi değilse boş liste olur", async () => {
    post.mockResolvedValue({
      data: { data: { answer: "x", sources: "bozuk" } },
    });
    expect((await estimatesRepository.priceEstimate("a")).sources).toEqual([]);
  });

  it("boş yanıt hata olarak döner (özel durum fırlatmaz)", async () => {
    post.mockResolvedValue({ data: { data: { answer: "   " } } });
    const res = await estimatesRepository.priceEstimate("a");
    expect(res.status).toBe("error");
    expect(res.sources).toEqual([]);
  });

  it.each([
    [503, "Bu özellik şu anda kullanılamıyor"],
    [429, "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin."],
    [502, "Tahmin servisine ulaşılamadı"],
  ])(
    "HTTP %s: backend mesajı hata kartına taşınır",
    async (status, message) => {
      post.mockRejectedValue(axiosError(status, message));
      const res = await estimatesRepository.priceEstimate("a");
      expect(res).toMatchObject({
        status: "error",
        answer: message,
        sources: [],
      });
    },
  );

  it("ağ hatasında genel mesaj döner", async () => {
    post.mockRejectedValue(new Error("network"));
    const res = await estimatesRepository.repairEstimate("a", "b");
    expect(res.status).toBe("error");
    expect(res.answer).toBe("Beklenmeyen bir hata oluştu");
  });
});

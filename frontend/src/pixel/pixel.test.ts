import { beforeEach, describe, expect, it, vi } from "vitest";
import { Pixel } from "./pixel";

function mockFetch(ok = true) {
  const fn = vi.fn(async () => {
    if (ok) {
      return {
        ok: true,
        status: 200,
        json: async () => ({}),
        text: async () => "",
      } as any;
    }
    // Важно: здесь именно исключение (как при проблемах сети / CORS / и т.п.)
    throw new Error("network");
  });
  (globalThis as any).fetch = fn;
  return fn;
}

describe("Pixel", () => {
  beforeEach(() => {
    // Перед каждым тестом очищаем sessionStorage, чтобы очередь/сессия не влияли на результат.
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it("sends a single event to ingest", async () => {
    // Базовая проверка: track() отправляет ровно один запрос на endpoint,
    // и payload содержит client_id / session_id / event.
    const fetchSpy = mockFetch(true);
    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: "c_123" });

    await px.track({
      event_type: "page_view",
      ts: "2026-02-02T10:00:00Z",
      url: "https://example.com/",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0];

    expect(url).toBe("/api/ingest/");
    expect(opts.method).toBe("POST");

    const body = JSON.parse(opts.body);
    expect(body.client_id).toBe("c_123");
    // session_id генерируется при init() и должен выглядеть как "s_xxx..."
    expect(body.session_id).toMatch(/^s_/);
    expect(body.event.event_type).toBe("page_view");
  });

  it("queues events to sessionStorage if request fails (TODO)", async () => {
    // Этот тест описывает ключевое требование надёжности:
    // если доставка не удалась (fetch выбросил исключение),
    // пиксель НЕ должен ломать страницу и должен сохранить событие в очередь в sessionStorage.

    mockFetch(false);
    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: "c_123" });

    // Ожидаемое поведение (Part 1):
    // - track() не выбрасывает исключение наружу
    // - событие сохраняется в очередь в sessionStorage по ключу "__pixel_queue__"
    await px.track({
      event_type: "click",
      ts: "2026-02-02T10:00:01Z",
      url: "https://example.com/pricing",
    });

    const raw = sessionStorage.getItem("__pixel_queue__");
    expect(raw).toBeTruthy();

    // Очередь — это JSON-массив payload-объектов (минимум 1 элемент)
    const queued = JSON.parse(raw as string);
    expect(Array.isArray(queued)).toBe(true);
    expect(queued.length).toBe(1);
  });

  it("flushes queued events on pagehide using sendBeacon (TODO)", async () => {
    // Этот тест проверяет поведение при выгрузке страницы:
    // пиксель должен попытаться отправить накопленную очередь событий на pagehide.
    //
    // Здесь мы заранее "кладём" в sessionStorage одно событие, как будто предыдущая отправка упала.
    sessionStorage.setItem(
      "__pixel_queue__",
      JSON.stringify([
        {
          client_id: "c_123",
          session_id: "s_1",
          event: {
            event_type: "form_submit",
            ts: "2026-02-02T10:00:02Z",
            url: "https://example.com/contact",
          },
        },
      ])
    );

    // В браузерах для выгрузки страницы предпочтительный механизм — sendBeacon.
    // Мы подменяем его, чтобы проверить, что он вызывается.
    const sendBeacon = vi.fn(() => true);
    (globalThis.navigator as any).sendBeacon = sendBeacon;

    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: "c_123" });

    // Ожидаемое поведение (Part 1):
    // - init() регистрирует обработчик события pagehide
    // - при pagehide пиксель читает очередь из sessionStorage и пытается отправить её через sendBeacon
    window.dispatchEvent(new Event("pagehide"));

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });
});

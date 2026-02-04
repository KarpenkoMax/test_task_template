export type PixelEventType = "page_view" | "click" | "form_submit";

export type PixelEvent = {
  event_type: PixelEventType;
  ts: string; // ISO-8601
  url: string;
  meta?: Record<string, unknown>;
};

export type PixelConfig = {
  endpoint: string; // например: /api/ingest/
  client_id: string;
  session_storage_key?: string;
};

export class Pixel {
  private endpoint = "/api/ingest/";
  private clientId = "";
  private sessionId = "";
  private storageKey = "__pixel_queue__";

  init(cfg: PixelConfig) {
    this.endpoint = cfg.endpoint;
    this.clientId = cfg.client_id;
    this.storageKey = cfg.session_storage_key || this.storageKey;

    // Простой session id для каждой вкладки.
    const existing = sessionStorage.getItem("__pixel_session_id__");
    if (existing) {
      this.sessionId = existing;
    } else {
      this.sessionId = `s_${Math.random().toString(16).slice(2, 10)}`;
      sessionStorage.setItem("__pixel_session_id__", this.sessionId);
    }

    // TODO (interview, Part 1):
    // 1) Загрузить из sessionStorage "очередь" событий, которые не удалось доставить ранее.
    //    Очередь хранится по ключу this.storageKey и представляет собой JSON-массив payload-объектов.
    //
    // 2) Зарегистрировать обработчик события pagehide:
    //    - при pagehide нужно прочитать очередь из sessionStorage
    //    - попытаться отправить её на this.endpoint
    //    - если доступен navigator.sendBeacon — использовать его
    //    - если отправка успешна — очистить очередь
    //
    // (Опционально) Можно попробовать "лучшей попыткой" отправить очередь сразу при init(),
    // но это не обязательное требование.
  }

  getSessionId() {
    return this.sessionId;
  }

  async track(event: PixelEvent) {
    const payload = {
      client_id: this.clientId,
      session_id: this.sessionId,
      event,
    };

    // Минимальная реализация: отправляем событие сразу.
    //
    // TODO (interview, Part 1):
    // - Сделать так, чтобы track() НЕ выбрасывал исключение наружу при сбое доставки.
    // - Если доставка не удалась, положить payload в очередь в sessionStorage (ключ this.storageKey).
    //   Под "сбоем доставки" в рамках задания понимается:
    //   - fetch выбросил исключение (например, сеть недоступна)
    //   - И/ИЛИ сервер вернул неуспешный ответ (response.ok === false)
    //
    // Важно: пиксель не должен ломать страницу — любые ошибки обработки нужно гасить
    // и аккуратно складывать события в очередь.
    await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // keepalive помогает, когда страница выгружается (не везде поддерживается)
      keepalive: true,
    });
  }
}

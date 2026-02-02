export type PixelEventType = "page_view" | "click" | "form_submit";

export type PixelEvent = {
  event_type: PixelEventType;
  ts: string; // ISO-8601
  url: string;
  meta?: Record<string, unknown>;
};

export type PixelConfig = {
  endpoint: string; // например, /api/ingest/
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

    // TODO (interview):
    // - загрузить очередь событий из sessionStorage
    // - отправить очередь при init
    // - отправлять на pagehide через sendBeacon/keepalive
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

    // Минимальная реализация: fire-and-forget.
    // TODO (interview): при ошибке запроса -> положить в sessionStorage и ретраить позже.
    await fetch(this.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      // keepalive помогает, когда страница вот-вот выгружается (не везде поддерживается)
      keepalive: true,
    });
  }
}

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
    throw new Error("network");
  });
  (globalThis as any).fetch = fn;
  return fn;
}

describe("Pixel", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.resetAllMocks();
  });

  it("sends a single event to ingest", async () => {
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
    expect(body.session_id).toMatch(/^s_/);
    expect(body.event.event_type).toBe("page_view");
  });

  it("queues events to sessionStorage if request fails (TODO)", async () => {
    mockFetch(false);
    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: "c_123" });

    // Expected behavior (interview):
    // - track() should not throw
    // - the event should be enqueued in sessionStorage
    await px.track({
      event_type: "click",
      ts: "2026-02-02T10:00:01Z",
      url: "https://example.com/pricing",
    });

    const raw = sessionStorage.getItem("__pixel_queue__");
    expect(raw).toBeTruthy();
    const queued = JSON.parse(raw as string);
    expect(Array.isArray(queued)).toBe(true);
    expect(queued.length).toBe(1);
  });

  it("flushes queued events on pagehide using sendBeacon (TODO)", async () => {
    // Prefill queue as if previous send failed
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

    const sendBeacon = vi.fn(() => true);
    (globalThis.navigator as any).sendBeacon = sendBeacon;

    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: "c_123" });

    // Expected behavior (interview): init() registers a pagehide handler
    // that flushes the queue using sendBeacon.
    window.dispatchEvent(new Event("pagehide"));

    expect(sendBeacon).toHaveBeenCalledTimes(1);
  });
});

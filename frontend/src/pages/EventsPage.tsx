import { useEffect, useMemo, useRef, useState } from "react";
import { getEvents, type GetEventsParams } from "../api/client";
import type { PixelEvent } from "../api/types";
import EventDetails from "../components/EventDetails";
import { Pixel } from "../pixel/pixel";

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}

export default function EventsPage() {
  const [items, setItems] = useState<PixelEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Фильтры (задача UI: подключить их к запросу)
  const [clientId, setClientId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [eventType, setEventType] = useState("");

  // Детали (задача UI: реализовать выбор строки + панель деталей)
  const [selected, setSelected] = useState<PixelEvent | null>(null);

  const pixelRef = useRef<Pixel | null>(null);

  const params: GetEventsParams = useMemo(
    () => ({
      // TODO (interview): применить фильтры
      // client_id: clientId || undefined,
      // session_id: sessionId || undefined,
      // event_type: eventType || undefined,
    }),
    [clientId, sessionId, eventType]
  );

  async function refresh() {
    setLoading(true);
    setError(null);
    try {
      const data = await getEvents(params);
      setItems(data.results);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: "ui_demo" });
    pixelRef.current = px;
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendTestEvent() {
    setSending(true);
    setError(null);
    try {
      const px = pixelRef.current;
      if (!px) {
        throw new Error("Pixel not initialized");
      }
      await px.track({
        event_type: "click",
        ts: new Date().toISOString(),
        url: window.location.href,
        meta: { source: "ui-button" },
      });
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ padding: 16, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto" }}>
      <h1 style={{ marginTop: 0 }}>Pixel Events</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>client_id</span>
          <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="c_123" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>session_id</span>
          <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} placeholder="s_456" />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 12, opacity: 0.7 }}>event_type</span>
          <select value={eventType} onChange={(e) => setEventType(e.target.value)}>
            <option value="">(any)</option>
            <option value="page_view">page_view</option>
            <option value="click">click</option>
            <option value="form_submit">form_submit</option>
          </select>
        </label>
        <button onClick={refresh} disabled={loading} style={{ height: 32 }}>
          {loading ? "Loading…" : "Refresh"}
        </button>
        <button onClick={sendTestEvent} disabled={loading || sending} style={{ height: 32 }}>
          {sending ? "Sending…" : "Send test event"}
        </button>
      </div>

      {error && (
        <div style={{ marginTop: 12, padding: 12, border: "1px solid #f00", borderRadius: 8 }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 12, marginTop: 12 }}>
        <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f7f7f7" }}>
                <th style={{ textAlign: "left", padding: 8, width: 170 }}>ts</th>
                <th style={{ textAlign: "left", padding: 8, width: 110 }}>event</th>
                <th style={{ textAlign: "left", padding: 8, width: 100 }}>client</th>
                <th style={{ textAlign: "left", padding: 8, width: 100 }}>session</th>
                <th style={{ textAlign: "left", padding: 8 }}>url</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ev) => (
                <tr
                  key={ev.id}
                  style={{ borderTop: "1px solid #eee", cursor: "pointer" }}
                  onClick={() => {
                    setSelected(ev);
                  }}
                >
                  <td style={{ padding: 8, whiteSpace: "nowrap" }}>{formatTs(ev.ts)}</td>
                  <td style={{ padding: 8 }}>{ev.event_type}</td>
                  <td style={{ padding: 8 }}>{ev.client_id}</td>
                  <td style={{ padding: 8 }}>{ev.session_id}</td>
                  <td style={{ padding: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace" }}>
                    {truncate(ev.url, 80)}
                  </td>
                </tr>
              ))}
              {!items.length && !loading && (
                <tr>
                  <td colSpan={5} style={{ padding: 12, opacity: 0.7 }}>
                    No events
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
          <h3 style={{ marginTop: 0 }}>Event details</h3>
          <EventDetails event={selected} />
        </div>
      </div>

      <div style={{ marginTop: 14, fontSize: 12, opacity: 0.7 }}>
        Tip: the DB is seeded on first start (seed_pixel_events). Once the ingest endpoint is implemented,
        you can send events from the pixel and refresh this page to see them.
      </div>
    </div>
  );
}

import { useEffect, useMemo, useRef, useState } from "react";
import { Pixel } from "../pixel/pixel";

type PixelEvent = {
  id: number;
  client_id: string;
  session_id: string;
  event_type: string;
  ts: string;
  url: string;
  meta: any;
  user_agent: string;
  ip: string;
  created_at: string;
};

type EventsResponse = {
  total: number;
  page: number;
  per_page: number;
  results: PixelEvent[];
};

function getOrCreateClientId(): string {
  const key = "__pixel_client_id__";
  const existing = localStorage.getItem(key);
  if (existing) return existing;
  const id = `c_${Math.random().toString(16).slice(2, 10)}`;
  localStorage.setItem(key, id);
  return id;
}

export default function EventsPage() {
  const pxRef = useRef<Pixel | null>(null);
  const [clientIdFilter, setClientIdFilter] = useState("");
  const [sessionIdFilter, setSessionIdFilter] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [events, setEvents] = useState<PixelEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<PixelEvent | null>(null);

  // Init pixel once
  useEffect(() => {
    const px = new Pixel();
    px.init({ endpoint: "/api/ingest/", client_id: getOrCreateClientId() });
    pxRef.current = px;
  }, []);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (clientIdFilter) params.set("client_id", clientIdFilter);
    if (sessionIdFilter) params.set("session_id", sessionIdFilter);
    if (eventTypeFilter) params.set("event_type", eventTypeFilter);
    return params.toString();
  }, [clientIdFilter, sessionIdFilter, eventTypeFilter]);

  async function loadEvents() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/events/${query ? `?${query}` : ""}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as EventsResponse;
      setEvents(data.results);
      setTotal(data.total);
      // keep selected in sync
      if (selected) {
        const updated = data.results.find((e) => e.id === selected.id) || null;
        setSelected(updated);
      }
    } catch (e: any) {
      setError(e?.message || "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  // Initial load
  useEffect(() => {
    void loadEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function trackFilterInput(field: string, value: string) {
    const px = pxRef.current;
    if (!px) return;
    // Fire and forget (should not block UI). Candidate may improve reliability in Part 1.
    void px
      .track({
        event_type: "click",
        ts: new Date().toISOString(),
        url: window.location.href,
        meta: {
          action: "input",
          field,
          value_length: value.length,
        },
      })
      .catch(() => {
        // ignore: pixel should not break the UI
      });
  }

  return (
    <div style={{ fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif", padding: 16 }}>
      <h1 style={{ margin: "0 0 12px 0" }}>Pixel events</h1>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-end", marginBottom: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, opacity: 0.8 }}>client_id</label>
          <input
            value={clientIdFilter}
            onChange={(e) => {
              setClientIdFilter(e.target.value);
              trackFilterInput("client_id", e.target.value);
            }}
            placeholder="e.g. c_demo"
            style={{ padding: "6px 8px", minWidth: 180 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, opacity: 0.8 }}>session_id</label>
          <input
            value={sessionIdFilter}
            onChange={(e) => {
              setSessionIdFilter(e.target.value);
              trackFilterInput("session_id", e.target.value);
            }}
            placeholder="e.g. s_1234"
            style={{ padding: "6px 8px", minWidth: 180 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <label style={{ fontSize: 12, opacity: 0.8 }}>event_type</label>
          <select
            value={eventTypeFilter}
            onChange={(e) => {
              setEventTypeFilter(e.target.value);
              trackFilterInput("event_type", e.target.value);
            }}
            style={{ padding: "6px 8px", minWidth: 180 }}
          >
            <option value="">(any)</option>
            <option value="page_view">page_view</option>
            <option value="click">click</option>
            <option value="form_submit">form_submit</option>
          </select>
        </div>

        <button
          onClick={() => void loadEvents()}
          style={{ padding: "7px 10px", cursor: "pointer" }}
          disabled={loading}
          title="Reload events"
        >
          {loading ? "Loading…" : "Refresh"}
        </button>

        <div style={{ fontSize: 12, opacity: 0.8, marginLeft: "auto" }}>Total: {total}</div>
      </div>

      {error ? (
        <div style={{ marginBottom: 12, color: "crimson" }}>Error: {error}</div>
      ) : null}

      <div style={{ border: "1px solid #ddd", borderRadius: 8, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f6f6f6" }}>
            <tr>
              <th style={{ textAlign: "left", padding: 8, fontSize: 12 }}>ts</th>
              <th style={{ textAlign: "left", padding: 8, fontSize: 12 }}>event_type</th>
              <th style={{ textAlign: "left", padding: 8, fontSize: 12 }}>client_id</th>
              <th style={{ textAlign: "left", padding: 8, fontSize: 12 }}>session_id</th>
              <th style={{ textAlign: "left", padding: 8, fontSize: 12 }}>url</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => {
              const isSel = selected?.id === e.id;
              return (
                <tr
                  key={e.id}
                  onClick={() => setSelected(e)}
                  style={{
                    cursor: "pointer",
                    background: isSel ? "#eef6ff" : "transparent",
                    borderTop: "1px solid #eee",
                  }}
                >
                  <td style={{ padding: 8, fontSize: 12, whiteSpace: "nowrap" }}>{new Date(e.ts).toLocaleString()}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>{e.event_type}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>{e.client_id}</td>
                  <td style={{ padding: 8, fontSize: 12 }}>{e.session_id}</td>
                  <td style={{ padding: 8, fontSize: 12, maxWidth: 520, overflow: "hidden", textOverflow: "ellipsis" }}>
                    {e.url}
                  </td>
                </tr>
              );
            })}
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: 12, fontSize: 12, opacity: 0.7 }}>
                  No events
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {/*
        Interview Part 2 UI task:
        - move the details block below into a separate component
        - render it as a modal dialog
        - BONUS: refresh table automatically when filters change (no Refresh click)
      */}
      <div style={{ marginTop: 16 }}>
        <h2 style={{ margin: "0 0 8px 0", fontSize: 16 }}>Details</h2>
        {selected ? (
          <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", rowGap: 6, columnGap: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7 }}>id</div>
              <div style={{ fontSize: 12 }}>{selected.id}</div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>ts</div>
              <div style={{ fontSize: 12 }}>{selected.ts}</div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>event_type</div>
              <div style={{ fontSize: 12 }}>{selected.event_type}</div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>client_id</div>
              <div style={{ fontSize: 12 }}>{selected.client_id}</div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>session_id</div>
              <div style={{ fontSize: 12 }}>{selected.session_id}</div>

              <div style={{ fontSize: 12, opacity: 0.7 }}>url</div>
              <div style={{ fontSize: 12, wordBreak: "break-all" }}>{selected.url}</div>
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>meta</div>
              <pre
                style={{
                  margin: 0,
                  padding: 10,
                  fontSize: 12,
                  background: "#f6f6f6",
                  borderRadius: 8,
                  overflow: "auto",
                  maxHeight: 240,
                }}
              >
                {JSON.stringify(selected.meta ?? null, null, 2)}
              </pre>
            </div>
          </div>
        ) : (
          <div style={{ fontSize: 12, opacity: 0.7 }}>Click a row in the table to see details.</div>
        )}
      </div>
    </div>
  );
}

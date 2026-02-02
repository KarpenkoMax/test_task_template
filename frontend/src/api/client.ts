import type { Paginated, PixelEvent } from "./types";

export type GetEventsParams = {
  client_id?: string;
  session_id?: string;
  event_type?: string;
  ts_from?: string;
  ts_to?: string;
  page?: number;
};

function qs(params: Record<string, string | number | undefined>): string {
  const u = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === "") return;
    u.set(k, String(v));
  });
  const s = u.toString();
  return s ? `?${s}` : "";
}

export async function getEvents(params: GetEventsParams = {}): Promise<Paginated<PixelEvent>> {
  const res = await fetch(`/api/events/${qs(params)}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GET /api/events failed: ${res.status} ${text}`);
  }
  return res.json();
}

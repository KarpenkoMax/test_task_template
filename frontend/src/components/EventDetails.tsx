import type { PixelEvent } from "../api/types";

type EventDetailsProps = {
  event: PixelEvent | null;
};

function formatTs(iso: string): string {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export default function EventDetails({ event }: EventDetailsProps) {
  if (!event) {
    return (
      <div style={{ opacity: 0.7 }}>
        Click a row to see details here.
        <div style={{ marginTop: 8, fontSize: 12 }}>
          (UI task: implement row selection + render details)
        </div>
      </div>
    );
  }

  return (
    <div>
      <div><strong>id:</strong> {event.id}</div>
      <div><strong>event_type:</strong> {event.event_type}</div>
      <div><strong>ts:</strong> {formatTs(event.ts)}</div>
      <div><strong>client_id:</strong> {event.client_id}</div>
      <div><strong>session_id:</strong> {event.session_id}</div>
      <div style={{ marginTop: 8 }}>
        <strong>url:</strong>
        <div style={{ wordBreak: "break-all" }}>{event.url}</div>
      </div>
      <div style={{ marginTop: 8 }}>
        <strong>meta:</strong>
        <pre style={{ fontSize: 12, overflow: "auto" }}>{JSON.stringify(event.meta, null, 2)}</pre>
      </div>
    </div>
  );
}

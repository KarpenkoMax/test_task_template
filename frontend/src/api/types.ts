export type PixelEvent = {
  id: number;
  created_at: string;
  client_id: string;
  session_id: string;
  event_type: string;
  ts: string;
  url: string;
  meta: Record<string, unknown>;
  user_agent: string;
  ip: string | null;
};

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

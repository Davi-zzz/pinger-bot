export type ServerOptions = {
  channel_id?: string;
  endpoints?: string[];
};

export interface TestConnectionParams {
  endpoint: string;
  channel_id: string;
  ports?: number[];
}

export interface TestsResult {
  message: string;
  portsStatus: PortResults[];
  status: STATUS;
}
type PortResults = {
  port: number;
  status: STATUS;
};

export enum STATUS {
  OK = 'OK',
  OFFLINE = 'OFFLINE',
}

export type IndexedServerOptions = Map<string, ServerOptions>;

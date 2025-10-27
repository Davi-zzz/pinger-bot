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
  portsStatus: TestStatus[];
  status: STATUS;
  responseTime: number;
}
type PortResults = {
  port: number;
  status: STATUS;
};

export enum STATUS {
  OK = 'OK',
  OFFLINE = 'OFFLINE',
}
export type TestPortResult = {
  port: number;
  result: Promise<TestStatus>;
};

export type TestStatus = {
  port: number;
} & PartialResult;

type PartialResult = {
  status: STATUS;
  responseTime: number;
};
export type PingResult = {
  endpoint: string;
} & PartialResult;
export type Reports = { [endpoint: string]: number[] };
export type IndexedServerOptions = Map<string, ServerOptions>;

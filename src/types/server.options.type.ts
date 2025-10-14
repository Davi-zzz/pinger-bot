export type ServerOptions = {
    channel_id?: string;
    endpoint?:string;
    ports?:number[]
}

export type IndexedServerOptions = Map<string, ServerOptions>;
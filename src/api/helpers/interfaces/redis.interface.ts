import { SessionData } from "express-session";
import Redis from "ioredis";

interface Serializer {
    parse(s: string): SessionData | Promise<SessionData>
    stringify(s: SessionData): string
}


interface RedisStoreOptions {
    client: Redis;
    prefix?: string;
    scanCount?: number;
    ttl?: number | ((session: SessionData) => number);
    disableTTL?: boolean;
    disableTouch?: boolean;
    serializer?: {
        stringify: (obj: SessionData) => string;
        parse: (str: string) => SessionData;
    };
    logErrors?: boolean;
    db?: number;
}

export {
    Serializer,
    RedisStoreOptions,
}
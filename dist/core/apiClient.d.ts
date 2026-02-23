import type { DataPostResponse, VerifyResponse } from "../models";
export declare class SoilApiClient {
    private readonly apiKey;
    private readonly baseUrl;
    constructor(baseUrl: string, apiKey: string);
    private headers;
    verify(): Promise<VerifyResponse>;
    postData(payload: Record<string, unknown>): Promise<DataPostResponse>;
}

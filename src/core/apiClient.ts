import type { DataPostResponse, VerifyResponse } from "../models";

async function fetchWithTimeout(url: string, options: RequestInit, ms: number): Promise<Response> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: controller.signal as any });
  } finally {
    clearTimeout(t);
  }
}

export class SoilApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string, private readonly apiKey: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  private headers() {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json"
    } as const;
  }

  async verify(): Promise<VerifyResponse> {
    const url = `${this.baseUrl}/api/verify`;
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: this.headers()
    }, 8000);

    const data = await res.json().catch(() => ({}));
    // Accept either valid: true or success: true from backend
    const valid =
      res.ok && (data?.valid === true || data?.success === true);
    return {
      valid,
      userId: data?.userId?.toString?.(),
      email: data?.email?.toString?.(),
      name: data?.name?.toString?.()
    };
  }

  async postData(payload: Record<string, unknown>): Promise<DataPostResponse> {
    const res = await fetchWithTimeout(`${this.baseUrl}/api/data`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(payload)
    }, 8000);

    const data = await res.json().catch(() => ({}));
    return {
      success: data?.success === true,
      id: data?.id?.toString?.(),
      createdAt: data?.createdAt?.toString?.()
    };
  }
}

import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { vi } from "vitest";
import { App } from "../App";
import type { CycleDetail, CycleSummary } from "../api/schema";
import { ThemeProvider } from "../design/theme/ThemeProvider";

/** 指定したパスでアプリ全体を描画します。 */
export function renderApp(path: string) {
  return render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </ThemeProvider>,
  );
}

type Handler = (body: unknown) => Response | Promise<Response>;

/**
 * fetch を「メソッド パス」ごとの応答に差し替えます。登録のない呼び出しは 500 を返します。
 * 返り値の mock で呼び出しを確認できます。
 */
export function mockFetch(routes: Record<string, Handler>) {
  const mock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const key = `${init?.method ?? "GET"} ${String(input)}`;
    const handler = routes[key];
    if (!handler) {
      return new Response(null, { status: 500 });
    }
    return handler(init?.body ? JSON.parse(String(init.body)) : undefined);
  });
  vi.stubGlobal("fetch", mock);
  return mock;
}

/** 呼び出しの本文を取り出します。 */
export function requestBody(mock: ReturnType<typeof mockFetch>, key: string): unknown {
  const call = mock.mock.calls.find(
    ([input, init]) => `${init?.method ?? "GET"} ${String(input)}` === key,
  );
  return call?.[1]?.body ? JSON.parse(String(call[1].body)) : undefined;
}

export function summary(overrides: Partial<CycleSummary> = {}): CycleSummary {
  return {
    id: 1,
    hypothesis: "ダミーの仮説",
    method: "ダミーの検証方法",
    start_date: "2026-11-20",
    end_date: "2026-12-03",
    status: "active",
    verdict: null,
    created_at: "2026-11-20T00:00:00Z",
    completed_at: null,
    ...overrides,
  };
}

export function detail(overrides: Partial<CycleDetail> = {}): CycleDetail {
  return {
    ...summary(),
    learnings: null,
    entries: [],
    stats: {
      recorded_days: 0,
      practiced_days: 0,
      avg_happiness_practiced: null,
      avg_happiness_not_practiced: null,
    },
    ...overrides,
  };
}

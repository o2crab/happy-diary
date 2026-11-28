import { type DependencyList, useCallback, useEffect, useState } from "react";
import { ApiError } from "../api/client";

export type LoadState<T> =
  | { status: "loading" }
  | { status: "error"; httpStatus?: number }
  | { status: "success"; data: T };

/**
 * 画面を開いたときにデータを読み込みます。
 * 返り値の setData で、保存後などに読み込み済みのデータを差し替えられます。
 */
export function useLoad<T>(loader: (signal: AbortSignal) => Promise<T>, deps: DependencyList) {
  const [state, setState] = useState<LoadState<T>>({ status: "loading" });
  // biome-ignore lint/correctness/useExhaustiveDependencies: loader の作り直しは deps で判断します
  const load = useCallback(loader, deps);

  useEffect(() => {
    const controller = new AbortController();
    setState({ status: "loading" });
    load(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) {
          setState({ status: "success", data });
        }
      },
      (error: unknown) => {
        if (!controller.signal.aborted) {
          setState({
            status: "error",
            httpStatus: error instanceof ApiError ? error.status : undefined,
          });
        }
      },
    );
    return () => controller.abort();
  }, [load]);

  const setData = useCallback((data: T) => setState({ status: "success", data }), []);
  return [state, setData] as const;
}

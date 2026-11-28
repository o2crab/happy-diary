import { api } from "../api/client";
import { CardLink } from "../design/components/CardLink";
import { formatPeriod, VERDICT_LABELS } from "./format";
import styles from "./pages.module.css";
import { EmptyState, ErrorMessage, Loading } from "./Status";
import { useLoad } from "./useLoad";

/** 過去のサイクル。完了したサイクルを判定付きで一覧します。 */
export function HistoryPage() {
  const [state] = useLoad((signal) => api.listCycles("completed", signal), []);

  return (
    <div className={styles.page}>
      <h2 className={styles.title}>これまで</h2>
      {state.status === "loading" && <Loading />}
      {state.status === "error" && <ErrorMessage>過去の検証を読み込めませんでした</ErrorMessage>}
      {state.status === "success" &&
        (state.data.length === 0 ? (
          <EmptyState>完了した検証はまだありません。振り返りを終えるとここに並びます。</EmptyState>
        ) : (
          <ul className={styles.list}>
            {state.data.map((cycle) => (
              <li key={cycle.id}>
                <CardLink href={`/cycles/${cycle.id}`} className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{cycle.hypothesis}</h3>
                  <p className={styles.muted}>{formatPeriod(cycle.start_date, cycle.end_date)}</p>
                  {cycle.verdict && (
                    <p className={styles.verdict}>判定: {VERDICT_LABELS[cycle.verdict]}</p>
                  )}
                </CardLink>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

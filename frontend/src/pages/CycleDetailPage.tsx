import { useNavigate, useParams } from "react-router";
import { api } from "../api/client";
import type { CycleDetail } from "../api/schema";
import { Button } from "../design/components/Button";
import { Card } from "../design/components/Card";
import { EntryForm } from "./EntryForm";
import { formatDate, formatPeriod, happinessLabel, VERDICT_LABELS } from "./format";
import styles from "./pages.module.css";
import { StatsList } from "./StatsList";
import { EmptyState, ErrorMessage, Loading } from "./Status";
import { useLoad } from "./useLoad";

/** サイクルの詳細。記録の入力と、記録の一覧を表示します。 */
export function CycleDetailPage() {
  const cycleId = Number(useParams().id);
  const [state, setCycle] = useLoad((signal) => api.getCycle(cycleId, signal), [cycleId]);

  if (state.status === "loading") return <Loading />;
  if (state.status === "error") {
    return (
      <ErrorMessage>
        {state.httpStatus === 404 ? "検証が見つかりません" : "検証を読み込めませんでした"}
      </ErrorMessage>
    );
  }
  return <CycleDetailView cycle={state.data} onSaved={setCycle} />;
}

function CycleDetailView({
  cycle,
  onSaved,
}: {
  cycle: CycleDetail;
  onSaved: (cycle: CycleDetail) => void;
}) {
  const navigate = useNavigate();
  const isActive = cycle.status === "active";

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>{cycle.hypothesis}</h2>
        {isActive && (
          <Button variant="tonal" onPress={() => void navigate(`/cycles/${cycle.id}/review`)}>
            振り返る
          </Button>
        )}
      </div>
      <dl className={styles.facts}>
        <div>
          <dt>検証方法</dt>
          <dd className={styles.prewrap}>{cycle.method}</dd>
        </div>
        <div>
          <dt>期間</dt>
          <dd>{formatPeriod(cycle.start_date, cycle.end_date)}</dd>
        </div>
      </dl>

      <section className={styles.section} aria-labelledby="stats-heading">
        <h3 id="stats-heading" className={styles.sectionTitle}>
          集計
        </h3>
        <StatsList stats={cycle.stats} />
      </section>

      {isActive ? (
        <section className={styles.section} aria-labelledby="entry-heading">
          <h3 id="entry-heading" className={styles.sectionTitle}>
            記録する
          </h3>
          <EntryForm cycle={cycle} onSaved={onSaved} />
        </section>
      ) : (
        <section className={styles.section} aria-labelledby="review-heading">
          <h3 id="review-heading" className={styles.sectionTitle}>
            振り返り
          </h3>
          <Card variant="filled" className={styles.cardContent}>
            {cycle.verdict && (
              <p className={styles.verdict}>判定: {VERDICT_LABELS[cycle.verdict]}</p>
            )}
            <p className={styles.prewrap}>{cycle.learnings}</p>
          </Card>
        </section>
      )}

      <section className={styles.section} aria-labelledby="entries-heading">
        <h3 id="entries-heading" className={styles.sectionTitle}>
          記録
        </h3>
        {cycle.entries.length === 0 ? (
          <EmptyState>まだ記録がありません</EmptyState>
        ) : (
          <ul className={styles.list}>
            {[...cycle.entries].reverse().map((entry) => (
              <li key={entry.date}>
                <Card variant="outlined" as="article" className={styles.cardContent}>
                  <h4 className={styles.cardTitle}>{formatDate(entry.date)}</h4>
                  <p>
                    <span className={entry.practiced ? styles.practiced : styles.muted}>
                      {entry.practiced ? "実行した" : "実行しなかった"}
                    </span>
                    {" ・ "}幸福度 {happinessLabel(entry.happiness)}
                  </p>
                  {entry.note && <p className={styles.prewrap}>{entry.note}</p>}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

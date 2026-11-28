import type { CycleStats } from "../api/schema";
import { formatAverage } from "./format";
import styles from "./pages.module.css";

/** サイクルの集計を一覧で表示します。 */
export function StatsList({ stats }: { stats: CycleStats }) {
  const items = [
    { label: "記録した日数", value: `${stats.recorded_days}日` },
    { label: "実行した日数", value: `${stats.practiced_days}日` },
    { label: "実行した日の平均幸福度", value: formatAverage(stats.avg_happiness_practiced) },
    {
      label: "実行しなかった日の平均幸福度",
      value: formatAverage(stats.avg_happiness_not_practiced),
    },
  ];
  return (
    <dl className={styles.stats}>
      {items.map((item) => (
        <div key={item.label} className={styles.stat}>
          <dt>{item.label}</dt>
          <dd>{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}

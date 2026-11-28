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
  // 各項目をラベル付きのグループにし、支援技術やテストから項目名で取れるようにする
  return (
    <div className={styles.stats}>
      {items.map((item) => (
        // biome-ignore lint/a11y/useSemanticElements: フォームではないため fieldset ではなく role="group" を使う
        <div key={item.label} role="group" aria-label={item.label} className={styles.stat}>
          <span className={styles.statLabel}>{item.label}</span>
          <span className={styles.statValue}>{item.value}</span>
        </div>
      ))}
    </div>
  );
}

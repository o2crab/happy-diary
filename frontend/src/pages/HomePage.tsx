import addIcon from "@material-symbols/svg-400/rounded/add.svg";
import { useNavigate } from "react-router";
import { api } from "../api/client";
import { Button } from "../design/components/Button";
import { CardLink } from "../design/components/CardLink";
import { formatPeriod } from "./format";
import styles from "./pages.module.css";
import { EmptyState, ErrorMessage, Loading } from "./Status";
import { useLoad } from "./useLoad";

/** ホーム。進行中のサイクルを一覧します。 */
export function HomePage() {
  const navigate = useNavigate();
  const [state] = useLoad((signal) => api.listCycles("active", signal), []);

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>いまの検証</h2>
        <Button icon={addIcon} onPress={() => void navigate("/cycles/new")}>
          仮説を追加
        </Button>
      </div>
      {state.status === "loading" && <Loading />}
      {state.status === "error" && <ErrorMessage>検証の一覧を読み込めませんでした</ErrorMessage>}
      {state.status === "success" &&
        (state.data.length === 0 ? (
          <EmptyState>
            進行中の検証はありません。「仮説を追加」から、試したい暮らし方を登録しましょう。
          </EmptyState>
        ) : (
          <ul className={styles.list}>
            {state.data.map((cycle) => (
              <li key={cycle.id}>
                <CardLink href={`/cycles/${cycle.id}`} className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{cycle.hypothesis}</h3>
                  <p className={styles.muted}>{formatPeriod(cycle.start_date, cycle.end_date)}</p>
                </CardLink>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}

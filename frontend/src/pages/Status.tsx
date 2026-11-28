import errorIcon from "@material-symbols/svg-400/rounded/error.svg";
import type { ReactNode } from "react";
import { Icon } from "../design/components/Icon";
import styles from "./pages.module.css";

/** 読み込み中の表示。 */
export function Loading() {
  return (
    <p className={styles.muted} role="status">
      読み込み中…
    </p>
  );
}

/** 読み込みや保存に失敗したときの表示。 */
export function ErrorMessage({ children }: { children: ReactNode }) {
  return (
    <p className={styles.error} role="alert">
      <Icon src={errorIcon} size={20} />
      <span>{children}</span>
    </p>
  );
}

/** 0 件のときの案内。 */
export function EmptyState({ children }: { children: ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}

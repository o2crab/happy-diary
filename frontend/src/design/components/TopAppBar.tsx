import type { ReactNode } from "react";
import styles from "./TopAppBar.module.css";

export type TopAppBarProps = {
  title: ReactNode;
  /** 左端の操作(戻るボタンなど) */
  leading?: ReactNode;
  /** 右端の操作 */
  trailing?: ReactNode;
};

/** M3 の Small top app bar。 */
export function TopAppBar({ title, leading, trailing }: TopAppBarProps) {
  return (
    <header className={styles.bar}>
      {leading && <div className={styles.actions}>{leading}</div>}
      <h1 className={styles.title}>{title}</h1>
      {trailing && <div className={styles.actions}>{trailing}</div>}
    </header>
  );
}

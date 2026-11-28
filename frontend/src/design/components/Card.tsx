import type { HTMLAttributes } from "react";
import styles from "./Card.module.css";
import { cx } from "./shared/cx";

export type CardVariant = "elevated" | "filled" | "outlined";

export type CardProps = HTMLAttributes<HTMLElement> & {
  variant?: CardVariant;
  /** 意味に合わせて要素を選びます(独立した内容なら article、まとまりなら section) */
  as?: "div" | "section" | "article";
};

/** M3 の Card(操作しない表示用)。 */
export function Card({ variant = "filled", as: Element = "div", className, ...props }: CardProps) {
  return <Element {...props} className={cx(styles.card, styles[variant], className)} />;
}

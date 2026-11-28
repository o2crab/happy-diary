import type { ReactNode } from "react";
import { Link as AriaLink, type LinkProps as AriaLinkProps } from "react-aria-components";
import type { CardVariant } from "./Card";
import cardStyles from "./Card.module.css";
import styles from "./CardLink.module.css";
import { cx } from "./shared/cx";

export type CardLinkProps = Omit<AriaLinkProps, "className" | "style" | "children"> & {
  href: string;
  variant?: CardVariant;
  className?: string;
  /** カードの中身。リンクの読み上げ名になるため、見出しを先頭に置きます */
  children: ReactNode;
};

/** カード全体を押せるリンクにした M3 の Card(一覧の項目など)。 */
export function CardLink({ variant = "filled", className, children, ...props }: CardLinkProps) {
  return (
    <AriaLink
      {...props}
      data-variant={variant}
      className={cx(cardStyles.card, cardStyles[variant], styles.cardLink, className)}
    >
      {children}
    </AriaLink>
  );
}

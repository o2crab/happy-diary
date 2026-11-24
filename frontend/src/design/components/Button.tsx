import type { ReactNode } from "react";
import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import styles from "./Button.module.css";
import { Icon } from "./Icon";
import { cx } from "./shared/cx";

export type ButtonVariant = "filled" | "tonal" | "outlined" | "text" | "elevated";

export type ButtonProps = Omit<AriaButtonProps, "className" | "style" | "children"> & {
  variant?: ButtonVariant;
  /** 先頭に表示するアイコンの URL */
  icon?: string;
  className?: string;
  children: ReactNode;
};

/** M3 の Common button。 */
export function Button({ variant = "filled", icon, className, children, ...props }: ButtonProps) {
  return (
    <AriaButton
      {...props}
      className={cx(styles.button, styles[variant], icon && styles.withIcon, className)}
    >
      {icon && <Icon src={icon} size={18} />}
      {children}
    </AriaButton>
  );
}

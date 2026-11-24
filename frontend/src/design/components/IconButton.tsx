import { Button as AriaButton, type ButtonProps as AriaButtonProps } from "react-aria-components";
import { Icon } from "./Icon";
import styles from "./IconButton.module.css";
import { cx } from "./shared/cx";

export type IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";

export type IconButtonProps = Omit<
  AriaButtonProps,
  "className" | "style" | "children" | "aria-label"
> & {
  /** アイコンの URL */
  icon: string;
  /** 読み上げ用のラベル。アイコンだけでは意味が伝わらないため必須です */
  label: string;
  variant?: IconButtonVariant;
  className?: string;
};

/** M3 の Icon button。 */
export function IconButton({
  icon,
  label,
  variant = "standard",
  className,
  ...props
}: IconButtonProps) {
  return (
    <AriaButton
      {...props}
      aria-label={label}
      className={cx(styles.iconButton, styles[variant], className)}
    >
      <Icon src={icon} size={24} />
    </AriaButton>
  );
}

import type { ReactNode } from "react";
import {
  Radio as AriaRadio,
  RadioGroup as AriaRadioGroup,
  type RadioGroupProps as AriaRadioGroupProps,
  type RadioProps as AriaRadioProps,
  FieldError,
  Label,
  Text,
} from "react-aria-components";
import styles from "./RadioGroup.module.css";
import { cx } from "./shared/cx";
import control from "./shared/selectionControl.module.css";

export type RadioGroupProps = Omit<AriaRadioGroupProps, "className" | "style" | "children"> & {
  /** グループのラベル。読み上げ名にもなります */
  label: string;
  /** ラベルの下に表示する補足 */
  description?: string;
  /** 指定するとエラー状態にして表示します */
  errorMessage?: string;
  /** 選択肢の並べ方。既定は縦並び */
  orientation?: "horizontal" | "vertical";
  className?: string;
  children: ReactNode;
};

/** M3 の Radio button をまとめるグループ。矢印キーで選択を移動できます。 */
export function RadioGroup({
  label,
  description,
  errorMessage,
  orientation = "vertical",
  isInvalid,
  className,
  children,
  ...props
}: RadioGroupProps) {
  return (
    <AriaRadioGroup
      {...props}
      orientation={orientation}
      isInvalid={isInvalid || errorMessage !== undefined}
      className={cx(styles.group, className)}
    >
      <Label className={styles.label}>{label}</Label>
      {description && (
        <Text slot="description" className={styles.supporting}>
          {description}
        </Text>
      )}
      <div className={styles.options} data-orientation={orientation}>
        {children}
      </div>
      <FieldError className={cx(styles.supporting, styles.error)}>{errorMessage}</FieldError>
    </AriaRadioGroup>
  );
}

export type RadioProps = Omit<AriaRadioProps, "className" | "style" | "children"> & {
  /** 選択肢のラベル。読み上げ名にもなります */
  children: ReactNode;
  className?: string;
};

/** M3 の Radio button。RadioGroup の中で使います。 */
export function Radio({ children, className, ...props }: RadioProps) {
  return (
    <AriaRadio {...props} className={cx(control.control, styles.radio, className)}>
      <span className={control.target}>
        <span className={styles.circle} />
      </span>
      <span>{children}</span>
    </AriaRadio>
  );
}

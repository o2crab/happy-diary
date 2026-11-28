import { useState } from "react";
import {
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  FieldError,
  Input,
  Label,
  Text,
  TextArea,
} from "react-aria-components";
import { cx } from "./shared/cx";
import styles from "./TextField.module.css";

export type TextFieldVariant = "filled" | "outlined";

export type TextFieldProps = Omit<AriaTextFieldProps, "className" | "style" | "children"> & {
  label: string;
  variant?: TextFieldVariant;
  /** 入力欄の下に表示する補足 */
  description?: string;
  /** 指定するとエラー状態にして表示します。未指定ならブラウザ標準の検証メッセージを表示します */
  errorMessage?: string;
  /** true で複数行入力(日記の本文など) */
  multiline?: boolean;
  /** 複数行入力の最小行数 */
  rows?: number;
  placeholder?: string;
  className?: string;
};

/** M3 の Text field。ラベルは入力中または値があるときに上へ移動します。 */
export function TextField({
  label,
  variant = "filled",
  description,
  errorMessage,
  multiline = false,
  rows = 3,
  placeholder,
  className,
  value,
  defaultValue,
  onChange,
  isInvalid,
  ...props
}: TextFieldProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue ?? "");
  const currentValue = value ?? uncontrolledValue;
  const isFilled = currentValue.length > 0 || Boolean(placeholder);

  return (
    <AriaTextField
      {...props}
      value={value}
      defaultValue={defaultValue}
      onChange={(next) => {
        setUncontrolledValue(next);
        onChange?.(next);
      }}
      isInvalid={isInvalid || errorMessage !== undefined}
      className={cx(styles.field, styles[variant], className)}
      data-variant={variant}
      data-filled={isFilled || undefined}
      data-multiline={multiline || undefined}
    >
      <div className={styles.container}>
        <Label className={styles.label}>{label}</Label>
        {multiline ? (
          <TextArea className={styles.input} rows={rows} placeholder={placeholder} />
        ) : (
          <Input className={styles.input} placeholder={placeholder} />
        )}
      </div>
      {description && !errorMessage && (
        <Text slot="description" className={styles.supporting}>
          {description}
        </Text>
      )}
      <FieldError className={cx(styles.supporting, styles.error)}>{errorMessage}</FieldError>
    </AriaTextField>
  );
}

import checkIcon from "@material-symbols/svg-400/rounded/check.svg";
import type { ReactNode } from "react";
import {
  Checkbox as AriaCheckbox,
  type CheckboxProps as AriaCheckboxProps,
} from "react-aria-components";
import styles from "./Checkbox.module.css";
import { Icon } from "./Icon";
import { cx } from "./shared/cx";
import control from "./shared/selectionControl.module.css";

export type CheckboxProps = Omit<AriaCheckboxProps, "className" | "style" | "children"> & {
  /** ラベル。読み上げ名にもなります */
  children: ReactNode;
  className?: string;
};

/** M3 の Checkbox。ラベルを押しても切り替わります。 */
export function Checkbox({ children, className, ...props }: CheckboxProps) {
  return (
    <AriaCheckbox {...props} className={cx(control.control, styles.checkbox, className)}>
      {({ isSelected }) => (
        <>
          <span className={control.target}>
            <span className={styles.box}>
              {isSelected && <Icon src={checkIcon} size={18} className={styles.check} />}
            </span>
          </span>
          <span>{children}</span>
        </>
      )}
    </AriaCheckbox>
  );
}

import type { CSSProperties } from "react";
import styles from "./Icon.module.css";
import { cx } from "./shared/cx";

export type IconProps = {
  /** `@material-symbols/svg-400/rounded/*.svg` を import した URL */
  src: string;
  /** 指定しなければ親の文字サイズに合わせます */
  size?: number;
  className?: string;
};

/** Material Symbols(Rounded)を文字色で描画する装飾用アイコン。意味はボタンなどのラベルで伝えます。 */
export function Icon({ src, size, className }: IconProps) {
  const style = {
    "--icon-src": `url("${src}")`,
    ...(size === undefined ? {} : { "--icon-size": `${size}px` }),
  } as CSSProperties;
  return <span aria-hidden="true" className={cx(styles.icon, className)} style={style} />;
}

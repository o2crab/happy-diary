import { Link } from "react-aria-components";
import { Icon } from "./Icon";
import styles from "./NavigationBar.module.css";
import { cx } from "./shared/cx";

export type NavigationItem = {
  href: string;
  label: string;
  /** `@material-symbols/svg-400/rounded/*.svg` を import した URL(塗りなし) */
  icon: string;
  /** 現在地のときに使う塗りありのアイコン(`*-fill.svg`)。省略すると icon を使います */
  selectedIcon?: string;
};

export type NavigationBarProps = {
  items: NavigationItem[];
  /** 現在の項目の href。一致した項目に aria-current="page" を付けます */
  currentHref?: string;
  /** ナビゲーション領域の読み上げ名 */
  label?: string;
  className?: string;
};

/**
 * M3 の Navigation bar / Navigation rail。
 * 600px 未満は画面下部のバー、600px 以上は左の rail として固定表示します。
 * 画面側は --app-navigation-bar-height(下)または --app-navigation-rail-width(左)の分を空けます。
 */
export function NavigationBar({
  items,
  currentHref,
  label = "メイン",
  className,
}: NavigationBarProps) {
  return (
    <nav aria-label={label} className={cx(styles.navigation, className)}>
      <ul className={styles.list}>
        {items.map((item) => {
          const isCurrent = item.href === currentHref;
          return (
            <li key={item.href} className={styles.listItem}>
              <Link
                href={item.href}
                aria-current={isCurrent ? "page" : undefined}
                className={styles.item}
              >
                <span className={styles.indicator}>
                  <Icon src={isCurrent ? (item.selectedIcon ?? item.icon) : item.icon} size={24} />
                </span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

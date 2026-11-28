import addIcon from "@material-symbols/svg-400/rounded/add.svg";
import editNoteIcon from "@material-symbols/svg-400/rounded/edit_note.svg";
import favoriteIcon from "@material-symbols/svg-400/rounded/favorite.svg";
import historyIcon from "@material-symbols/svg-400/rounded/history.svg";
import historyFillIcon from "@material-symbols/svg-400/rounded/history-fill.svg";
import homeIcon from "@material-symbols/svg-400/rounded/home.svg";
import homeFillIcon from "@material-symbols/svg-400/rounded/home-fill.svg";
import searchIcon from "@material-symbols/svg-400/rounded/search.svg";
import { Button, type ButtonVariant } from "./components/Button";
import { Card, type CardVariant } from "./components/Card";
import { CardLink } from "./components/CardLink";
import { Checkbox } from "./components/Checkbox";
import { IconButton, type IconButtonVariant } from "./components/IconButton";
import { NavigationBar, type NavigationItem } from "./components/NavigationBar";
import { Radio, RadioGroup } from "./components/RadioGroup";
import { TextField, type TextFieldVariant } from "./components/TextField";
import { TopAppBar } from "./components/TopAppBar";
import styles from "./Gallery.module.css";
import { ThemeToggle } from "./theme/ThemeToggle";

// 開発時だけ /__design で表示する部品の見本。本番ビルドには含めません。

const COLOR_ROLES = [
  ["primary", "on-primary"],
  ["primary-container", "on-primary-container"],
  ["secondary", "on-secondary"],
  ["secondary-container", "on-secondary-container"],
  ["tertiary", "on-tertiary"],
  ["tertiary-container", "on-tertiary-container"],
  ["error", "on-error"],
  ["error-container", "on-error-container"],
  ["surface", "on-surface"],
  ["surface-container-low", "on-surface"],
  ["surface-container", "on-surface"],
  ["surface-container-highest", "on-surface-variant"],
  ["inverse-surface", "inverse-on-surface"],
] as const;

const TYPESCALES = ["display", "headline", "title", "body", "label"].flatMap((role) =>
  ["large", "medium", "small"].map((size) => `${role}-${size}`),
);

const BUTTON_VARIANTS: ButtonVariant[] = ["filled", "tonal", "outlined", "text", "elevated"];
const ICON_BUTTON_VARIANTS: IconButtonVariant[] = ["standard", "filled", "tonal", "outlined"];
const CARD_VARIANTS: CardVariant[] = ["elevated", "filled", "outlined"];
const TEXT_FIELD_VARIANTS: TextFieldVariant[] = ["filled", "outlined"];
const NAVIGATION_ITEMS: NavigationItem[] = [
  { href: "#now", label: "いまの検証", icon: homeIcon, selectedIcon: homeFillIcon },
  { href: "#history", label: "これまで", icon: historyIcon, selectedIcon: historyFillIcon },
];

function typescaleStyle(name: string) {
  const token = (part: string) => `var(--md-sys-typescale-${name}-${part})`;
  return {
    fontFamily: token("font"),
    fontSize: token("size"),
    lineHeight: token("line-height"),
    fontWeight: token("weight"),
    letterSpacing: token("tracking"),
  };
}

export function Gallery() {
  return (
    <>
      <TopAppBar title="デザインシステム見本" trailing={<ThemeToggle />} />
      <main className={styles.page}>
        <section className={styles.section}>
          <h2 className={styles.heading}>カラー</h2>
          <div className={styles.swatches}>
            {COLOR_ROLES.map(([background, foreground]) => (
              <div
                key={background}
                className={styles.swatch}
                style={{
                  backgroundColor: `var(--md-sys-color-${background})`,
                  color: `var(--md-sys-color-${foreground})`,
                }}
              >
                {background}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>タイポグラフィ</h2>
          {TYPESCALES.map((name) => (
            <p key={name} style={typescaleStyle(name)}>
              {name} 今日の小さな幸せ
            </p>
          ))}
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>ボタン</h2>
          {[false, true].map((isDisabled) => (
            <div key={String(isDisabled)} className={styles.row}>
              {BUTTON_VARIANTS.map((variant) => (
                <Button key={variant} variant={variant} isDisabled={isDisabled}>
                  {variant}
                </Button>
              ))}
            </div>
          ))}
          <div className={styles.row}>
            <Button icon={addIcon}>仮説を追加</Button>
            <Button variant="tonal" icon={editNoteIcon}>
              記録する
            </Button>
          </div>
          <div className={styles.row}>
            {ICON_BUTTON_VARIANTS.map((variant) => (
              <IconButton key={variant} variant={variant} icon={favoriteIcon} label={variant} />
            ))}
            {ICON_BUTTON_VARIANTS.map((variant) => (
              <IconButton
                key={`${variant}-disabled`}
                variant={variant}
                icon={searchIcon}
                label={`${variant}(無効)`}
                isDisabled
              />
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>テキストフィールド</h2>
          <div className={styles.grid}>
            {TEXT_FIELD_VARIANTS.map((variant) => (
              <div key={variant} className={styles.stack}>
                <TextField variant={variant} label="仮説" description="試したいことを書きます" />
                <TextField variant={variant} label="検証方法" defaultValue="毎朝 15 分散歩する" />
                <TextField variant={variant} label="期間" errorMessage="期間を入力してください" />
                <TextField
                  variant={variant}
                  label="無効"
                  defaultValue="編集できません"
                  isDisabled
                />
                <TextField variant={variant} label="今日の記録" multiline />
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>カード</h2>
          <div className={styles.grid}>
            {CARD_VARIANTS.map((variant) => (
              <Card key={variant} variant={variant} className={styles.stack}>
                <h3 style={typescaleStyle("title-medium")}>{variant}</h3>
                <p>朝の散歩で気分が軽くなった。</p>
                <TextField variant="outlined" label="ひとこと" />
              </Card>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>チェックボックスとラジオボタン</h2>
          <div className={styles.row}>
            <Checkbox>実行した</Checkbox>
            <Checkbox defaultSelected>実行した</Checkbox>
            <Checkbox isInvalid>未入力</Checkbox>
            <Checkbox isDisabled>無効</Checkbox>
            <Checkbox isDisabled defaultSelected>
              無効(選択)
            </Checkbox>
          </div>
          <div className={styles.grid}>
            <RadioGroup label="幸福度" orientation="horizontal" defaultValue="4">
              {["1", "2", "3", "4", "5"].map((score) => (
                <Radio key={score} value={score}>
                  {score}
                </Radio>
              ))}
            </RadioGroup>
            <RadioGroup label="判定" description="期間を振り返って選びます">
              <Radio value="supported">支持された</Radio>
              <Radio value="not_supported">支持されなかった</Radio>
              <Radio value="inconclusive" isDisabled>
                判断できない(無効)
              </Radio>
            </RadioGroup>
            <RadioGroup label="判定" errorMessage="判定を選んでください">
              <Radio value="supported">支持された</Radio>
              <Radio value="not_supported">支持されなかった</Radio>
            </RadioGroup>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>カードリンク</h2>
          <div className={styles.grid}>
            {CARD_VARIANTS.map((variant) => (
              <CardLink key={variant} variant={variant} href="#card-link">
                <h3 style={typescaleStyle("title-medium")}>{variant}</h3>
                <p>朝に 15 分散歩すると気分が上がる</p>
              </CardLink>
            ))}
            <CardLink href="#card-link" isDisabled>
              <h3 style={typescaleStyle("title-medium")}>無効</h3>
              <p>押せません</p>
            </CardLink>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.heading}>ナビゲーション</h2>
          <p>600px 未満は下部のバー、600px 以上は左の rail になります。</p>
          <div className={styles.navigationPreview}>
            <NavigationBar
              items={NAVIGATION_ITEMS}
              currentHref="#now"
              label="見本のナビゲーション"
            />
          </div>
        </section>
      </main>
    </>
  );
}

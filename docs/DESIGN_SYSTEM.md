# デザインシステム

Happiness Spiral の UI は [Material Design 3](https://m3.material.io/)(M3)に準拠する。アプリ構成は [開発ガイド](DEV_GUIDE.md) を参照する。

## デザインの方向性

自然で暖かみがあり、幸せな日常に寄り添う雰囲気を目指す。M3 の仕組み(トークン、状態表現、部品の仕様)は守り、M3 がカスタマイズを認める範囲で暖かさを出す。

- **カラー**: オリーブ色を primary、小麦色を secondary、テラコッタ寄りの暖色を tertiary にする。tertiary は「幸せを感じた」記録のアクセントなどに控えめに使う。背景(neutral)は小麦色の色相から低彩度で作り、生成り(クリーム)寄りにする。ダークテーマも冷たい黒ではなく焦げ茶寄りにする。
- **タイポグラフィ**: display、headline、title-large は丸みのある Zen Maru Gothic(brand 書体)、それ以外は可読性を優先して Noto Sans JP(plain 書体)を使う。
- **シェイプ**: やさしい印象のため、部品の角丸は M3 の標準より一段大きいトークンを割り当てる(下表)。
- **モーション**: emphasized easing を中心に、ゆったりめの duration を選ぶ。
- **アイコン**: Material Symbols の Rounded スタイルを使い、塗り(FILL)は選択状態のときだけにする。

## 実装方針

- トークンは M3 公式の CSS 変数名(`--md-sys-color-primary`、`--md-sys-typescale-body-large-size` など)で定義する。M3 にない値(余白など)は `--app-` 接頭辞を付ける。
- 部品の操作性とアクセシビリティは React Aria に任せ、見た目は M3 の仕様どおりに CSS Modules で作る。
- スタイルは CSS Modules と CSS 変数で書く。

## ディレクトリ構成

| パス | 内容 |
| --- | --- |
| `frontend/src/design/index.css` | トークンの集約と全体の基本スタイル。`main.tsx` で 1 回だけ読み込む |
| `frontend/src/design/tokens/` | トークン。`colors.css` は生成物、それ以外は手書き |
| `frontend/src/design/theme/` | テーマ(ライト、ダーク、システム設定に従う)の切り替え |
| `frontend/src/design/components/` | 共通部品。部品ごとに `Xxx.tsx`、`Xxx.module.css`、テストを置く |
| `frontend/scripts/gen-color-tokens.ts` | ブランド色からカラートークンを生成するスクリプト |

## カラートークン

`colors.css` はブランド色から `material-color-utilities` で生成する。直接編集せず、ブランド色や彩度を `gen-color-tokens.ts` で変えてから `mise run design:tokens` で再生成する。生成物のズレは `mise run check` の `design:check` で検出する。

生成時に主要な前景色と背景色の組み合わせが WCAG AA(4.5:1)を満たすかを検証し、満たさなければ生成を失敗させる。

## タイポグラフィ

サイズと太さは M3 の基準値に合わせる。日本語は欧文より字面が詰まって見えるため、body の行間だけ M3 より広げている。Zen Maru Gothic は CSS の容量を抑えるため 400 だけを読み込む。太字の見出しが必要になったら、該当する太さを `main.tsx` に追加する。

## 角丸の割り当て

| 部品 | トークン |
| --- | --- |
| ボタン、アイコンボタン | `full`(M3 標準と同じ) |
| チップ | `medium`(M3 標準は `small`) |
| カード | `large`(M3 標準は `medium`) |
| テキストフィールド | `small`(M3 標準は `extra-small`) |
| FAB | `large`(M3 標準と同じ) |
| ダイアログ、ボトムシート | `extra-large`(M3 標準と同じ) |

## レイアウト

余白は 4px グリッドの `--app-space-*` を使う。CSS 変数はメディアクエリで使えないため、ブレークポイントは次の値を直接書く。

| window size class | 幅 | ナビゲーション |
| --- | --- | --- |
| compact | 600px 未満 | NavigationBar |
| medium | 600px 以上 840px 未満 | NavigationRail |
| expanded | 840px 以上 | NavigationRail |

## テーマ切り替え

`ThemeProvider` が設定を保持し、`<html data-theme>` に `light` か `dark` を付ける。システム設定に従う場合は属性を付けず、`prefers-color-scheme` で切り替わる。設定は `localStorage` に保存し、使えない環境ではそのセッション内だけ反映する。`index.html` の初期化スクリプトが描画前に保存済みの設定を反映し、ちらつきを防ぐ。

## 書き方のルール

- 色、文字サイズ、角丸、影、余白、時間は直書きせず、トークンを参照する。
- 背景色を変えたら、対応する `on-*` 色を前景色に使う(例: `primary-container` には `on-primary-container`)。
- hover、focus、pressed の表現は state layer の不透明度トークンで作る。
- アニメーションは motion トークンを使う。視差効果を減らす設定では duration が自動で短くなる。

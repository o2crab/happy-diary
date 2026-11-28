import contrastIcon from "@material-symbols/svg-400/rounded/contrast.svg";
import darkModeIcon from "@material-symbols/svg-400/rounded/dark_mode.svg";
import lightModeIcon from "@material-symbols/svg-400/rounded/light_mode.svg";
import { IconButton } from "../components/IconButton";
import { useTheme } from "./ThemeProvider";
import type { ThemePreference } from "./theme";

const NEXT: Record<ThemePreference, ThemePreference> = {
  system: "light",
  light: "dark",
  dark: "system",
};

const ICONS: Record<ThemePreference, string> = {
  system: contrastIcon,
  light: lightModeIcon,
  dark: darkModeIcon,
};

const LABELS: Record<ThemePreference, string> = {
  system: "システム設定",
  light: "ライト",
  dark: "ダーク",
};

/** 押すたびに システム設定 → ライト → ダーク の順でテーマを切り替えます。 */
export function ThemeToggle() {
  const { preference, setPreference } = useTheme();
  return (
    <IconButton
      icon={ICONS[preference]}
      label={`テーマ: ${LABELS[preference]}(押すと${LABELS[NEXT[preference]]}に切り替え)`}
      onPress={() => setPreference(NEXT[preference])}
    />
  );
}

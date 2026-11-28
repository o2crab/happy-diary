import { createContext, useContext, useLayoutEffect } from "react";

/** 上部のバーの「戻る」の行き先を、画面から App に伝えます。 */
export const BackLinkContext = createContext<(href: string | undefined) => void>(() => {});

/**
 * この画面を表示している間、上部のバーに「戻る」を出します。
 * 行き先は直前の画面ではなく画面ごとに決め、URL を直接開いたときも同じ場所へ戻れるようにします。
 */
export function useBackLink(href: string | undefined) {
  const setBackHref = useContext(BackLinkContext);
  // 画面の描画より前に行き先を反映し、古い行き先のボタンが押せる瞬間を作らない。
  useLayoutEffect(() => {
    setBackHref(href);
    return () => setBackHref(undefined);
  }, [href, setBackHref]);
}

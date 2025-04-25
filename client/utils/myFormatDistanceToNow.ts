import { formatDistanceToNow } from "date-fns";
import { enUS, vi, ja } from "date-fns/locale";
import { Language } from "@/enums/Language";
import { useLanguage } from "@/components/language-provider";

const localeMap = {
  [Language.English]: enUS,
  [Language.Vietnamese]: vi,
  [Language.Japanese]: ja,
};

export function useFormatTime() {
  const { language } = useLanguage();

  const formatTimeToNow = (
    date: Date | number,
    options?: { addSuffix?: boolean }
  ) => {
    const locale = localeMap[language] || enUS;

    return formatDistanceToNow(date, {
      addSuffix: true,
      ...options,
      locale,
    });
  };

  return { formatTimeToNow };
}

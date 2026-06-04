import { useTranslation } from "react-i18next";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const SUPPORTED_LANGUAGES = [
  { code: "en", flag: "🇬🇧", labelKey: "languageSelectorEnglish" },
  { code: "el", flag: "🇬🇷", labelKey: "languageSelectorGreek" },
] as const;

/**
 * Language selector dropdown.
 *
 * Displays the current language as a flag emoji trigger.
 * Expands to a list of all supported languages on click.
 * Calls `i18n.changeLanguage()` on selection — no page reload needed.
 */
export default function LanguageToggle() {
  const { i18n, t } = useTranslation();
  const current =
    SUPPORTED_LANGUAGES.find((lang) => lang.code === i18n.language) ??
    SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-lg"
          aria-label="Language selector"
        >
          {current.flag}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {SUPPORTED_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => i18n.changeLanguage(lang.code)}
            className={lang.code === i18n.language ? "font-medium text-primary" : ""}
          >
            <span className="mr-2 text-base">{lang.flag}</span>
            {t(lang.labelKey)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

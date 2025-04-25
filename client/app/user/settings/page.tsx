"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useTheme } from "@/components/theme-provider";
import { useLanguage } from "@/components/language-provider";
import { useUpdateUserSetting } from "@/hooks/api/use-user";
import { Language } from "@/enums/Language";
import { Theme } from "@/enums/Theme";
import { useToast } from "@/hooks/use-toast";
import { useUserContext } from "@/contexts/userContext";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const { mutate: updateUserSetting } = useUpdateUserSetting();
  const { toast } = useToast();
  const { user } = useUserContext();

  const handleSave = () => {
    setLoading(true);

    updateUserSetting(
      {
        theme,
        language,
      },
      {
        onSuccess: () => {
          toast({
            title: t("success"),
            description: t("settingUpdated"),
          });
          setLoading(false);
        },
        onError: () => {
          toast({
            title: t("error"),
          });
          setLoading(false);
        },
      }
    );
  };

  return (
    <div>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">{t("settings")}</h1>

        <div className="space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t("language")}</h2>
            <RadioGroup
              value={language}
              onValueChange={(value) => setLanguage(value as Language)}
              className="space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Language.English} id="en" />
                <Label htmlFor="en" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>English</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Language.Vietnamese} id="vi" />
                <Label htmlFor="vi" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>Tiếng Việt</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={Language.Japanese} id="ja" />
                <Label htmlFor="ja" className="flex items-center space-x-2">
                  <Globe className="h-4 w-4" />
                  <span>日本語</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">{t("darkMode")}</h2>
            <div className="flex items-center space-x-4">
              <Sun className="h-5 w-5" />
              <Switch
                checked={theme === Theme.Dark}
                onCheckedChange={(checked) =>
                  setTheme(checked ? Theme.Dark : Theme.Light)
                }
              />
              <Moon className="h-5 w-5" />
            </div>
          </div>

          <Separator />
          {user?.havePassword && (
            <>
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{t("changePassword")}</h2>
                <Button onClick={() => router.push("/user/change-password")}>
                  {t("changePassword")}
                </Button>
              </div>
              <Separator />
            </>
          )}

          <Button onClick={handleSave} disabled={loading}>
            {loading ? t("saving") : t("save")}
          </Button>
        </div>
      </div>
    </div>
  );
}

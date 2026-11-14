import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { SETTING_KEYS } from "@/lib/platform-settings";
import { getErrorFromCatch } from "@/lib/api-errors";
import { useSettings } from "@/context/SettingsContext";
import {
  fetchSettingCategory,
  resetSettingCategory,
  updateSettingCategory,
  type SettingItem,
} from "@/services/settings-api";
import { RotateCcw, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = {
  category: string;
};

const toDraft = (settings: SettingItem[]) =>
  Object.fromEntries(settings.map((item) => [item.key, item.value ?? ""]));

export const PlatformCategorySettings = ({ category }: Props) => {
  const { toast } = useToast();
  const { fetchSettings } = useSettings();
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<SettingItem[]>([]);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmMaintenance, setConfirmMaintenance] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchSettingCategory(category);
        if (cancelled) return;
        setLabel(data.label);
        setDescription(data.description);
        setItems(data.settings);
        const values = toDraft(data.settings);
        setDraft(values);
        setSaved(values);
      } catch (err) {
        if (!cancelled) {
          toast({
            title: "Unable to load settings",
            description: getErrorFromCatch(err, "Failed to load settings"),
            variant: "destructive",
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [category, toast]);

  const dirty = useMemo(
    () => items.some((item) => (draft[item.key] ?? "") !== (saved[item.key] ?? "")),
    [items, draft, saved]
  );

  const setValue = (key: string, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const persist = async (values: Record<string, string>) => {
    setSaving(true);
    try {
      const data = await updateSettingCategory(category, values);
      setItems(data.settings);
      const next = toDraft(data.settings);
      setDraft(next);
      setSaved(next);
      await fetchSettings?.();
      toast({
        title: "Settings saved",
        description: `${data.label} settings were updated.`,
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: getErrorFromCatch(err, "Failed to save settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    const turningOnMaintenance =
      items.some((item) => item.key === SETTING_KEYS.maintenanceMode) &&
      saved[SETTING_KEYS.maintenanceMode] !== "true" &&
      draft[SETTING_KEYS.maintenanceMode] === "true";
    if (turningOnMaintenance) {
      setConfirmMaintenance(true);
      return;
    }
    void persist(draft);
  };

  const handleReset = async () => {
    setSaving(true);
    try {
      const data = await resetSettingCategory(category);
      setItems(data.settings);
      const next = toDraft(data.settings);
      setDraft(next);
      setSaved(next);
      await fetchSettings?.();
      toast({
        title: "Defaults restored",
        description: `${data.label} settings were reset.`,
      });
    } catch (err) {
      toast({
        title: "Reset failed",
        description: getErrorFromCatch(err, "Failed to reset settings"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading settings…</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{label}</h2>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.key} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <Label className="text-base font-medium">{item.label}</Label>
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                {draft[item.key] !== saved[item.key] && (
                  <p className="text-xs text-amber-600 mt-2">Unsaved change</p>
                )}
              </div>
              {item.dataType === "BOOLEAN" && (
                <Switch
                  checked={draft[item.key] === "true"}
                  disabled={!item.editable || saving}
                  onCheckedChange={(checked) => setValue(item.key, String(checked))}
                />
              )}
            </div>
            {item.dataType === "STRING" || item.dataType === "EMAIL" || item.dataType === "SECRET" ? (
              <Input
                type={item.dataType === "EMAIL" ? "email" : item.dataType === "SECRET" ? "password" : "text"}
                autoComplete={item.dataType === "SECRET" ? "new-password" : undefined}
                placeholder={
                  item.dataType === "SECRET" && saved[item.key]
                    ? "Saved — type a new password to replace it"
                    : undefined
                }
                value={draft[item.key] ?? ""}
                disabled={!item.editable || saving}
                onChange={(event) => setValue(item.key, event.target.value)}
              />
            ) : null}
            {item.dataType === "TEXT" ? (
              <Textarea
                value={draft[item.key] ?? ""}
                disabled={!item.editable || saving}
                onChange={(event) => setValue(item.key, event.target.value)}
              />
            ) : null}
            {item.dataType === "INTEGER" ? (
              <Input
                type="number"
                min={item.min ?? undefined}
                max={item.max ?? undefined}
                value={draft[item.key] ?? ""}
                disabled={!item.editable || saving}
                onChange={(event) => setValue(item.key, event.target.value)}
              />
            ) : null}
            {item.dataType === "ENUM" ? (
              <Select
                value={draft[item.key] ?? item.defaultValue}
                onValueChange={(value) => setValue(item.key, value)}
                disabled={!item.editable || saving}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(item.allowedValues ?? []).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option === "dashboard" ? "Administrator dashboard" : option === "welcome" ? "Welcome page" : option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" className="gap-2" onClick={() => void handleReset()} disabled={saving}>
          <RotateCcw className="h-4 w-4" />
          Reset to defaults
        </Button>
        <Button className="gap-2" onClick={handleSave} disabled={saving || !dirty}>
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>

      <AlertDialog open={confirmMaintenance} onOpenChange={setConfirmMaintenance}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Turn on maintenance mode?</AlertDialogTitle>
            <AlertDialogDescription>
              People who are not Super Admin will be blocked from signing in until you turn this off.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => void persist(draft)}>Turn on</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

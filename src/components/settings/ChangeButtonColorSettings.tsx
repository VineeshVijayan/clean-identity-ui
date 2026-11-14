import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSettings } from "@/context/SettingsContext";
import { useToast } from "@/hooks/use-toast";
import { getErrorFromCatch } from "@/lib/api-errors";
import {
  BUTTON_COLOR_KEYS,
  buttonColorSelections,
  DEFAULT_BUTTON_COLORS,
  appearanceButtonColorsJson,
  parseButtonColors,
  SETTING_KEYS,
  setPendingButtonColor,
  setPendingButtonColors,
  writeLocalButtonConfigs,
  type ButtonColorConfig,
  type ButtonColorKey,
} from "@/lib/platform-settings";
import { saveUiSettings } from "@/services/settings-api";
import { Check, Palette, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const colorPresets = [
  { id: 1, name: "Identity Blue", primary: "#333366", border: "#333366" },
  { id: 2, name: "Ocean", primary: "#005d90", border: "#005d90" },
  { id: 3, name: "Sunset", primary: "#f58b1f", border: "#f58b1f" },
  { id: 4, name: "Forest", primary: "#2d5a3f", border: "#2d5a3f" },
  { id: 5, name: "Royal", primary: "#4c1d95", border: "#4c1d95" },
  { id: 6, name: "Slate", primary: "#334155", border: "#334155" },
];

const BUTTON_LABELS: Record<ButtonColorKey, string> = {
  btn1: "Button One – Create User",
  btn2: "Button Two – My Requests",
  btn3: "Button Three – My Approvals",
};

const ButtonEditor = ({
  btnKey,
  config,
  saving,
  onChange,
  onApply,
  onReset,
}: {
  btnKey: ButtonColorKey;
  config: ButtonColorConfig;
  saving: boolean;
  onChange: (config: ButtonColorConfig) => void;
  onApply: () => void;
  onReset: () => void;
}) => {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  useEffect(() => {
    const match = colorPresets.find(
      (p) => p.primary.toLowerCase() === config.bgColor.toLowerCase()
    );
    setSelectedPreset(match ? match.id : null);
  }, [config.bgColor]);

  const handlePresetSelect = (preset: (typeof colorPresets)[0]) => {
    setSelectedPreset(preset.id);
    onChange({ ...config, bgColor: preset.primary, borderColor: preset.border });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Color Presets</CardTitle>
            <CardDescription>Choose a predefined color scheme</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {colorPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSelect(preset)}
                  className={`relative p-3 rounded-lg border-2 transition-all text-left hover:border-primary ${
                    selectedPreset === preset.id
                      ? "border-primary bg-primary/5"
                      : "border-border"
                  }`}
                >
                  {selectedPreset === preset.id && (
                    <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="flex gap-2 mb-2">
                    <div className="h-7 w-7 rounded-full border shadow-sm" style={{ backgroundColor: preset.primary }} />
                  </div>
                  <p className="text-xs font-medium">{preset.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Button Styling</CardTitle>
            <CardDescription>Customize colors and shape</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => onChange({ ...config, bgColor: e.target.value })}
                  className="w-10 h-9 rounded cursor-pointer border border-border"
                />
                <Input
                  value={config.bgColor}
                  onChange={(e) => onChange({ ...config, bgColor: e.target.value })}
                  placeholder="#333366"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Border Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={config.borderColor}
                  onChange={(e) => onChange({ ...config, borderColor: e.target.value })}
                  className="w-10 h-9 rounded cursor-pointer border border-border"
                />
                <Input
                  value={config.borderColor}
                  onChange={(e) => onChange({ ...config, borderColor: e.target.value })}
                  placeholder="#333366"
                  className="flex-1"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">{config.borderRadius[0]}px</span>
              </div>
              <Slider
                value={config.borderRadius}
                onValueChange={(val) => onChange({ ...config, borderRadius: val })}
                max={24}
                step={1}
              />
            </div>

            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="flex gap-3 p-4 bg-muted rounded-lg">
                <Button
                  style={{
                    backgroundColor: config.bgColor,
                    borderColor: config.borderColor,
                    borderRadius: `${config.borderRadius[0]}px`,
                    borderWidth: "2px",
                    borderStyle: "solid",
                    color: "#fff",
                  }}
                >
                  {BUTTON_LABELS[btnKey].split("–")[0].trim()}
                </Button>
                <Button
                  variant="outline"
                  style={{
                    borderColor: config.borderColor,
                    borderRadius: `${config.borderRadius[0]}px`,
                    color: config.bgColor,
                  }}
                >
                  Outline
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button onClick={onApply} disabled={saving}>
          <Check className="h-4 w-4 mr-2" />
          Apply Changes
        </Button>
        <Button variant="outline" onClick={onReset} disabled={saving}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

export const ChangeButtonColorSettings = () => {
  const { settings, setSettings, fetchSettings } = useSettings();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const hydrated = useRef(false);
  const [configs, setConfigs] = useState<Record<ButtonColorKey, ButtonColorConfig>>(() =>
    buttonColorSelections(settings)
  );

  useEffect(() => {
    if (hydrated.current) return;
    if (!settings || Object.keys(settings).length === 0) return;
    setConfigs(buttonColorSelections(settings));
    hydrated.current = true;
  }, [settings]);

  const updateConfig = (btnKey: ButtonColorKey, config: ButtonColorConfig) => {
    setConfigs((prev) => ({ ...prev, [btnKey]: config }));
    setPendingButtonColor(btnKey, config);
  };

  const persist = async (
    next: Partial<Record<ButtonColorKey, ButtonColorConfig>>,
    description: string
  ) => {
    setSaving(true);
    try {
      const payload = JSON.stringify(next);
      writeLocalButtonConfigs(next);
      setPendingButtonColors(next);
      await saveUiSettings({ [SETTING_KEYS.buttonColors]: payload });
      setSettings((prev: Record<string, unknown>) => ({
        ...prev,
        [SETTING_KEYS.buttonColors]: payload,
      }));
      window.dispatchEvent(new Event("buttonStyleChanged"));
      await fetchSettings?.();
      toast({ title: "Changes Applied", description });
    } catch (err) {
      toast({
        title: "Error",
        description: getErrorFromCatch(err, "Failed to save button colors"),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleApply = (btnKey: ButtonColorKey) => {
    setPendingButtonColor(btnKey, configs[btnKey]);
    const next = parseButtonColors({
      [SETTING_KEYS.buttonColors]: appearanceButtonColorsJson(settings),
    });
    void persist(next, `${BUTTON_LABELS[btnKey]} styles updated.`);
  };

  const handleReset = (btnKey: ButtonColorKey) => {
    const resetConfig = DEFAULT_BUTTON_COLORS[btnKey];
    setConfigs((prev) => ({ ...prev, [btnKey]: resetConfig }));
    const next = { ...parseButtonColors(settings), [btnKey]: resetConfig };
    void persist(next, `${BUTTON_LABELS[btnKey]} reset to defaults.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Change Button Colour</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Independently customize each dashboard button's background color, border color, and styling
        </p>
      </div>

      <Tabs defaultValue="btn1" className="w-full">
        <TabsList className="mb-4">
          {BUTTON_COLOR_KEYS.map((key) => (
            <TabsTrigger key={key} value={key}>
              {key === "btn1" ? "Button One" : key === "btn2" ? "Button Two" : "Button Three"}
            </TabsTrigger>
          ))}
        </TabsList>
        {BUTTON_COLOR_KEYS.map((key) => (
          <TabsContent key={key} value={key}>
            <ButtonEditor
              btnKey={key}
              config={configs[key]}
              saving={saving}
              onChange={(config) => updateConfig(key, config)}
              onApply={() => handleApply(key)}
              onReset={() => handleReset(key)}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

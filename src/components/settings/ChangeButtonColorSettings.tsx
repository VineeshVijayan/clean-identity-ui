import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Check, Palette, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";

/* ---------- Color Presets ---------- */
const colorPresets = [
  { id: 1, name: "Identity Blue", primary: "#333366", border: "#333366" },
  { id: 2, name: "Ocean", primary: "#005d90", border: "#005d90" },
  { id: 3, name: "Sunset", primary: "#f58b1f", border: "#f58b1f" },
  { id: 4, name: "Forest", primary: "#2d5a3f", border: "#2d5a3f" },
  { id: 5, name: "Royal", primary: "#4c1d95", border: "#4c1d95" },
  { id: 6, name: "Slate", primary: "#334155", border: "#334155" },
];

interface ButtonConfig {
  bgColor: string;
  borderColor: string;
  borderRadius: number[];
}

const defaultConfigs: Record<string, ButtonConfig> = {
  btn1: { bgColor: "#333366", borderColor: "#333366", borderRadius: [8] },
  btn2: { bgColor: "#f58b1f", borderColor: "#f58b1f", borderRadius: [8] },
  btn3: { bgColor: "#cf2027", borderColor: "#cf2027", borderRadius: [8] },
};

const BUTTON_LABELS: Record<string, string> = {
  btn1: "Button One – Create User",
  btn2: "Button Two – My Requests",
  btn3: "Button Three – My Approvals",
};

const loadConfig = (key: string): ButtonConfig => {
  try {
    const saved = localStorage.getItem(`buttonConfig_${key}`);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return defaultConfigs[key];
};

const saveConfig = (key: string, config: ButtonConfig) => {
  localStorage.setItem(`buttonConfig_${key}`, JSON.stringify(config));
};

/* ---------- Single Button Editor ---------- */
const ButtonEditor = ({ btnKey }: { btnKey: string }) => {
  const { toast } = useToast();
  const [config, setConfig] = useState<ButtonConfig>(() => loadConfig(btnKey));
  const [selectedPreset, setSelectedPreset] = useState<number | null>(null);

  useEffect(() => {
    const match = colorPresets.find(
      (p) => p.primary.toLowerCase() === config.bgColor.toLowerCase()
    );
    setSelectedPreset(match ? match.id : null);
  }, [config.bgColor]);

  const handlePresetSelect = (preset: typeof colorPresets[0]) => {
    setSelectedPreset(preset.id);
    setConfig((prev) => ({ ...prev, bgColor: preset.primary, borderColor: preset.border }));
  };

  const handleApply = () => {
    saveConfig(btnKey, config);
    window.dispatchEvent(new Event("buttonStyleChanged"));
    toast({
      title: "Changes Applied",
      description: `${BUTTON_LABELS[btnKey]} styles updated.`,
    });
  };

  const handleReset = () => {
    const def = defaultConfigs[btnKey];
    setConfig(def);
    saveConfig(btnKey, def);
    window.dispatchEvent(new Event("buttonStyleChanged"));
    toast({ title: "Reset Successful", description: `${BUTTON_LABELS[btnKey]} reset to defaults.` });
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Presets */}
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

        {/* Custom Styling */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Button Styling</CardTitle>
            <CardDescription>Customize colors and shape</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* Background Color */}
            <div className="space-y-2">
              <Label>Background Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={config.bgColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                  className="w-10 h-9 rounded cursor-pointer border border-border"
                />
                <Input
                  value={config.bgColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, bgColor: e.target.value }))}
                  placeholder="#333366"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <Label>Border Color</Label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={config.borderColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                  className="w-10 h-9 rounded cursor-pointer border border-border"
                />
                <Input
                  value={config.borderColor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, borderColor: e.target.value }))}
                  placeholder="#333366"
                  className="flex-1"
                />
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">{config.borderRadius[0]}px</span>
              </div>
              <Slider
                value={config.borderRadius}
                onValueChange={(val) => setConfig((prev) => ({ ...prev, borderRadius: val }))}
                max={24}
                step={1}
              />
            </div>

            {/* Preview */}
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

      {/* Actions */}
      <div className="flex gap-3">
        <Button onClick={handleApply}>
          <Check className="h-4 w-4 mr-2" />
          Apply Changes
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

/* ---------- Main Component ---------- */
export const ChangeButtonColorSettings = () => {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Change Button Colour</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Independently customize each dashboard button's background color, border color, and styling
        </p>
      </div>

      {/* Tabs per button */}
      <Tabs defaultValue="btn1" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="btn1">Button One</TabsTrigger>
          <TabsTrigger value="btn2">Button Two</TabsTrigger>
          <TabsTrigger value="btn3">Button Three</TabsTrigger>
        </TabsList>
        <TabsContent value="btn1">
          <ButtonEditor btnKey="btn1" />
        </TabsContent>
        <TabsContent value="btn2">
          <ButtonEditor btnKey="btn2" />
        </TabsContent>
        <TabsContent value="btn3">
          <ButtonEditor btnKey="btn3" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

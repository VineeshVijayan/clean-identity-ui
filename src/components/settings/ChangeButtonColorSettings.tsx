import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { Check, Palette } from "lucide-react";
import { useState } from "react";

/* ---------- Color Presets ---------- */
const colorPresets = [
  { id: 1, name: "Identity Blue", primary: "#333366", accent: "#06a6cb" },
  { id: 2, name: "Ocean", primary: "#005d90", accent: "#06a6cb" },
  { id: 3, name: "Sunset", primary: "#f58b1f", accent: "#cf2027" },
  { id: 4, name: "Forest", primary: "#2d5a3f", accent: "#4ade80" },
  { id: 5, name: "Royal", primary: "#4c1d95", accent: "#a78bfa" },
  { id: 6, name: "Slate", primary: "#334155", accent: "#64748b" },
];

export const ChangeButtonColorSettings = () => {
  const { toast } = useToast();

  const [selectedPreset, setSelectedPreset] = useState(1);
  const [borderRadius, setBorderRadius] = useState<number[]>([8]);

  const activePreset = colorPresets.find(
    (preset) => preset.id === selectedPreset
  )!;

  const handleApply = () => {
    toast({
      title: "Changes Applied",
      description: "Button styles have been updated successfully.",
    });
  };

  const handleReset = () => {
    setSelectedPreset(1);
    setBorderRadius([8]);
    toast({
      title: "Reset Successful",
      description: "Button styles have been reset to default values.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title (replaces PageHeader) */}
      <div>
        <div className="flex items-center gap-3">
          <Palette className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-semibold">Change Button Colour</h1>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Customize button styles and colors across the application
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Presets */}
        <Card>
          <CardHeader>
            <CardTitle>Color Presets</CardTitle>
            <CardDescription>
              Choose a predefined color scheme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {colorPresets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPreset(preset.id)}
                  className={`relative p-4 rounded-lg border-2 transition-all text-left hover:border-accent ${selectedPreset === preset.id
                    ? "border-accent bg-accent/10"
                    : "border-border"
                    }`}
                >
                  {selectedPreset === preset.id && (
                    <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-accent flex items-center justify-center">
                      <Check className="h-3 w-3 text-accent-foreground" />
                    </div>
                  )}

                  <div className="flex gap-2 mb-3">
                    <div
                      className="h-8 w-8 rounded-full border shadow"
                      style={{ backgroundColor: preset.primary }}
                    />
                    <div
                      className="h-8 w-8 rounded-full border shadow"
                      style={{ backgroundColor: preset.accent }}
                    />
                  </div>

                  <p className="text-sm font-medium">{preset.name}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Button Styling */}
        <Card>
          <CardHeader>
            <CardTitle>Button Styling</CardTitle>
            <CardDescription>
              Adjust button appearance settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Border Radius */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Border Radius</Label>
                <span className="text-sm text-muted-foreground">
                  {borderRadius[0]}px
                </span>
              </div>
              <Slider
                value={borderRadius}
                onValueChange={setBorderRadius}
                max={24}
                step={1}
              />
            </div>

            {/* Preview */}
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="flex flex-wrap gap-3 p-4 bg-muted rounded-lg">
                <Button
                  style={{
                    backgroundColor: activePreset.primary,
                    borderRadius: `${borderRadius[0]}px`,
                  }}
                  className="text-white"
                >
                  Primary
                </Button>
                <Button
                  variant="secondary"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  Secondary
                </Button>
                <Button
                  variant="outline"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  Outline
                </Button>
                <Button
                  variant="destructive"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  Destructive
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Live Preview</CardTitle>
            <CardDescription>
              See how your changes will look in the application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-6 bg-background border rounded-lg space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button
                  style={{
                    backgroundColor: activePreset.primary,
                    borderRadius: `${borderRadius[0]}px`,
                  }}
                  className="text-white"
                >
                  Submit Request
                </Button>
                <Button
                  variant="outline"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  Cancel
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="sm"
                  variant="secondary"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  style={{ borderRadius: `${borderRadius[0]}px` }}
                >
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          className="gradient-primary text-primary-foreground"
          onClick={handleApply}
        >
          Apply Changes
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
      </div>
    </div>
  );
};

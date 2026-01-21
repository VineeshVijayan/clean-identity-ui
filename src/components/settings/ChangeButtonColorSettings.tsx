import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Brand color palette from requirements
const brandColors = [
  { name: "Light Gray", hex: "#e6e7e8", hsl: "220 7% 91%" },
  { name: "Deep Navy", hex: "#333366", hsl: "240 33% 30%" },
  { name: "Ocean Blue", hex: "#005d90", hsl: "200 100% 28%" },
  { name: "Cyan", hex: "#06a6cb", hsl: "193 95% 41%" },
  { name: "Orange", hex: "#f58b1f", hsl: "30 92% 54%" },
  { name: "Red", hex: "#cf2027", hsl: "358 77% 48%" },
];

// Button types that can be customized
const buttonTypes = [
  { id: "primary", label: "Primary Button", description: "Main action buttons" },
  { id: "secondary", label: "Secondary Button", description: "Secondary actions" },
  { id: "destructive", label: "Destructive Button", description: "Delete and danger actions" },
  { id: "accent", label: "Accent Button", description: "Highlighted actions" },
];

export const ChangeButtonColorSettings = () => {
  const { toast } = useToast();
  const [colorSelections, setColorSelections] = useState<Record<string, string>>({
    primary: "#06a6cb",
    secondary: "#333366",
    destructive: "#cf2027",
    accent: "#f58b1f",
  });
  const [customColor, setCustomColor] = useState("#06a6cb");

  const handleColorChange = (buttonType: string, color: string) => {
    setColorSelections((prev) => ({
      ...prev,
      [buttonType]: color,
    }));
  };

  const handleSave = () => {
    toast({
      title: "Button Colors Updated",
      description: "Button color settings have been saved successfully.",
    });
  };

  const handleReset = () => {
    setColorSelections({
      primary: "#06a6cb",
      secondary: "#333366",
      destructive: "#cf2027",
      accent: "#f58b1f",
    });
    toast({
      title: "Colors Reset",
      description: "Button colors have been reset to defaults.",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Change Button Colors</h3>
        <p className="text-sm text-muted-foreground">
          Customize the colors used for different button types throughout the application
        </p>
      </div>

      {/* Brand Color Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Brand Color Palette</CardTitle>
          <CardDescription>These are the approved brand colors for the application</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {brandColors.map((color) => (
              <div key={color.hex} className="text-center">
                <div
                  className="w-full h-16 rounded-lg border shadow-sm mb-2"
                  style={{ backgroundColor: color.hex }}
                />
                <p className="text-xs font-medium">{color.name}</p>
                <p className="text-xs text-muted-foreground">{color.hex}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Button Color Configuration */}
      <div className="grid gap-6 md:grid-cols-2">
        {buttonTypes.map((buttonType) => (
          <Card key={buttonType.id}>
            <CardHeader>
              <CardTitle className="text-base">{buttonType.label}</CardTitle>
              <CardDescription>{buttonType.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Color Selection */}
              <div className="flex flex-wrap gap-2">
                {brandColors.map((color) => (
                  <button
                    key={color.hex}
                    onClick={() => handleColorChange(buttonType.id, color.hex)}
                    className={`w-10 h-10 rounded-lg border-2 transition-all ${
                      colorSelections[buttonType.id] === color.hex
                        ? "border-foreground scale-110 shadow-lg"
                        : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>

              {/* Custom Color Input */}
              <div className="flex items-center gap-2">
                <Label htmlFor={`custom-${buttonType.id}`} className="text-sm">
                  Custom:
                </Label>
                <Input
                  id={`custom-${buttonType.id}`}
                  type="color"
                  value={colorSelections[buttonType.id]}
                  onChange={(e) => handleColorChange(buttonType.id, e.target.value)}
                  className="w-12 h-8 p-0 border-0"
                />
                <Input
                  type="text"
                  value={colorSelections[buttonType.id]}
                  onChange={(e) => handleColorChange(buttonType.id, e.target.value)}
                  className="w-24 h-8 text-xs"
                  placeholder="#000000"
                />
              </div>

              {/* Preview */}
              <div className="pt-2">
                <Label className="text-xs text-muted-foreground mb-2 block">Preview:</Label>
                <Button
                  style={{ backgroundColor: colorSelections[buttonType.id] }}
                  className="text-white"
                >
                  Sample {buttonType.label}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Full Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Button Preview</CardTitle>
          <CardDescription>Preview all button styles with your selected colors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button style={{ backgroundColor: colorSelections.primary }} className="text-white">
              Primary Action
            </Button>
            <Button style={{ backgroundColor: colorSelections.secondary }} className="text-white">
              Secondary Action
            </Button>
            <Button style={{ backgroundColor: colorSelections.destructive }} className="text-white">
              Delete
            </Button>
            <Button style={{ backgroundColor: colorSelections.accent }} className="text-white">
              Highlight
            </Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={handleReset}>
          Reset to Default
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};

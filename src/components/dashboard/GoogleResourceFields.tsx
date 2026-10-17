import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GOOGLE_RESOURCE_TYPES,
  buildGoogleResourceKey,
  googleResourceIdFromKey,
  googleResourceTypeFromKey,
} from "@/lib/application-access";

type GoogleResourceFieldsProps = {
  resourceKey: string;
  onResourceKeyChange: (key: string) => void;
  disabled?: boolean;
  helperText?: string;
  error?: string;
};

export const GoogleResourceFields = ({
  resourceKey,
  onResourceKeyChange,
  disabled = false,
  helperText,
  error,
}: GoogleResourceFieldsProps) => {
  const type = googleResourceTypeFromKey(resourceKey);
  const id = googleResourceIdFromKey(resourceKey);
  const selectedType = GOOGLE_RESOURCE_TYPES.find((item) => item.id === type);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Resource type</Label>
        <Select
          value={type}
          onValueChange={(nextType) => onResourceKeyChange(buildGoogleResourceKey(nextType, ""))}
          disabled={disabled}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a resource type..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border border-border shadow-lg z-50">
            {GOOGLE_RESOURCE_TYPES.map((item) => (
              <SelectItem key={item.id} value={item.id}>
                {item.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Resource</Label>
        <Input
          value={id}
          onChange={(event) => onResourceKeyChange(buildGoogleResourceKey(type || "GROUP", event.target.value))}
          placeholder={selectedType?.placeholder || "Resource id or email"}
          disabled={disabled || !type}
        />
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleResourceFields;

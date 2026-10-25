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
  fromSelectSafeValue,
  googleResourceIdFromKey,
  googleResourceTypeFromKey,
  toSelectSafeValue,
} from "@/lib/application-access";
import type { IntegrationProject } from "@/lib/integration-api";

type GoogleResourceFieldsProps = {
  resourceKey: string;
  onResourceKeyChange: (key: string) => void;
  projects?: IntegrationProject[];
  disabled?: boolean;
  helperText?: string;
  error?: string;
};

export const GoogleResourceFields = ({
  resourceKey,
  onResourceKeyChange,
  projects = [],
  disabled = false,
  helperText,
  error,
}: GoogleResourceFieldsProps) => {
  const type = googleResourceTypeFromKey(resourceKey);
  const id = googleResourceIdFromKey(resourceKey);
  const selectedType = GOOGLE_RESOURCE_TYPES.find((item) => item.id === type);
  const matchingProjects = projects.filter(
    (project) => googleResourceTypeFromKey(project.key) === type
  );
  const selectedFromList = matchingProjects.some((project) => project.key === resourceKey);

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
        {matchingProjects.length > 0 ? (
          <Select
            value={selectedFromList && resourceKey ? toSelectSafeValue(resourceKey) : ""}
            onValueChange={(value) => onResourceKeyChange(fromSelectSafeValue(value))}
            disabled={disabled || !type}
          >
            <SelectTrigger>
              <SelectValue placeholder={selectedType?.placeholder || "Choose a resource..."} />
            </SelectTrigger>
            <SelectContent className="bg-popover border border-border shadow-lg z-50">
              {matchingProjects.map((project) => (
                <SelectItem key={project.id || project.key} value={toSelectSafeValue(project.key)}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            value={id}
            onChange={(event) =>
              onResourceKeyChange(buildGoogleResourceKey(type || "GROUP", event.target.value))
            }
            placeholder={selectedType?.placeholder || "Resource id or email"}
            disabled={disabled || !type}
          />
        )}
        {error ? (
          <p className="text-xs text-destructive">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-muted-foreground">{helperText}</p>
        ) : !type ? (
          <p className="text-xs text-muted-foreground">
            Choose a type to see matching roles and resources.
          </p>
        ) : matchingProjects.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No live {selectedType?.label.toLowerCase()}s were returned. Enter one to continue.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default GoogleResourceFields;

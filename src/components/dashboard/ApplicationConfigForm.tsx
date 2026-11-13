import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { SECRET_PLACEHOLDER } from "@/lib/application-admin";
import type { ApplicationConfigField } from "@/services/application-api";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";

type Props = {
  schema: ApplicationConfigField[];
  values: Record<string, string>;
  secretsConfigured?: Record<string, boolean>;
  disabled?: boolean;
  onChange: (key: string, value: string) => void;
};

export const ApplicationConfigForm = ({
  schema,
  values,
  secretsConfigured = {},
  disabled = false,
  onChange,
}: Props) => {
  if (schema.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This integration has no connector schema. Add configuration fields below, or save the
        application and register a connector later.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {schema.map((field) => {
        const inputType = (field.inputType || "TEXT").toUpperCase();
        const configured = !!secretsConfigured[field.key];
        const secretPlaceholder = disabled ? SECRET_PLACEHOLDER : "Leave blank to keep the current secret";
        return (
          <div
            key={field.key}
            className={inputType === "TEXTAREA" ? "space-y-2 sm:col-span-2" : "space-y-2"}
          >
            <Label htmlFor={`cfg-${field.key}`}>
              {field.label}
              {field.required ? " *" : ""}
            </Label>
            {inputType === "TEXTAREA" ? (
              <Textarea
                id={`cfg-${field.key}`}
                value={values[field.key] || ""}
                placeholder={field.sensitive && configured ? secretPlaceholder : field.helpText || ""}
                onChange={(event) => onChange(field.key, event.target.value)}
                autoComplete="off"
                disabled={disabled}
              />
            ) : (
              <Input
                id={`cfg-${field.key}`}
                type={field.sensitive || inputType === "PASSWORD" ? "password" : inputType === "EMAIL" ? "email" : "text"}
                value={values[field.key] || ""}
                placeholder={
                  field.sensitive && configured
                    ? secretPlaceholder
                    : field.defaultValue || ""
                }
                onChange={(event) => onChange(field.key, event.target.value)}
                autoComplete="off"
                disabled={disabled}
              />
            )}
            {field.helpText ? (
              <p className="text-xs text-muted-foreground">{field.helpText}</p>
            ) : field.sensitive && configured ? (
              <p className="text-xs text-muted-foreground">
                A secret is already stored. Enter a new value only to replace it.
              </p>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

type SchemaEditorProps = {
  schema: ApplicationConfigField[];
  disabled?: boolean;
  onChange: (schema: ApplicationConfigField[]) => void;
};

export const ApplicationSchemaEditor = ({ schema, disabled, onChange }: SchemaEditorProps) => {
  const [key, setKey] = useState("");
  const [label, setLabel] = useState("");
  const [inputType, setInputType] = useState("TEXT");
  const [required, setRequired] = useState(true);
  const [sensitive, setSensitive] = useState(false);

  const addField = () => {
    const nextKey = key.trim().replace(/\s+/g, "");
    if (!nextKey || schema.some((field) => field.key === nextKey)) return;
    onChange([
      ...schema,
      {
        key: nextKey,
        label: label.trim() || nextKey,
        type: "STRING",
        inputType,
        required,
        sensitive,
        editableAfterOnboarding: true,
      },
    ]);
    setKey("");
    setLabel("");
    setInputType("TEXT");
    setRequired(true);
    setSensitive(false);
  };

  return (
    <div className="space-y-3 rounded-md border p-3">
      <div>
        <h4 className="text-sm font-medium">Configuration fields</h4>
        <p className="text-xs text-muted-foreground">
          Define the metadata this application needs. Sensitive fields are stored encrypted and never returned later.
        </p>
      </div>
      {schema.length > 0 ? (
        <div className="space-y-2">
          {schema.map((field) => (
            <div key={field.key} className="flex items-center justify-between gap-2 text-sm">
              <div>
                <span className="font-medium">{field.label}</span>
                <span className="ml-2 font-mono text-xs text-muted-foreground">{field.key}</span>
                {field.sensitive ? (
                  <span className="ml-2 text-xs text-muted-foreground">secret</span>
                ) : null}
                {field.required ? (
                  <span className="ml-2 text-xs text-muted-foreground">required</span>
                ) : null}
              </div>
              {disabled ? null : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label={`Remove ${field.label}`}
                  onClick={() => onChange(schema.filter((item) => item.key !== field.key))}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No fields yet.</p>
      )}
      {disabled ? null : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input placeholder="Key (baseUrl)" value={key} onChange={(event) => setKey(event.target.value)} />
          <Input placeholder="Label (Base URL)" value={label} onChange={(event) => setLabel(event.target.value)} />
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={inputType}
            onChange={(event) => setInputType(event.target.value)}
          >
            <option value="TEXT">Text</option>
            <option value="URL">URL</option>
            <option value="EMAIL">Email</option>
            <option value="PASSWORD">Password / secret</option>
            <option value="TEXTAREA">Long text</option>
          </select>
          <div className="flex items-center justify-between gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Switch checked={required} onCheckedChange={setRequired} />
              Required
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Switch
                checked={sensitive}
                onCheckedChange={(checked) => {
                  setSensitive(checked);
                  if (checked) setInputType("PASSWORD");
                }}
              />
              Sensitive
            </label>
          </div>
          <Button type="button" variant="outline" onClick={addField} className="sm:col-span-2">
            <Plus className="mr-2 h-4 w-4" />
            Add field
          </Button>
        </div>
      )}
    </div>
  );
};

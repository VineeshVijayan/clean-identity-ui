import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const countryCodes = [
  { code: "+1", country: "US" },
  { code: "+1", country: "CA" },
  { code: "+44", country: "GB" },
  { code: "+91", country: "IN" },
  { code: "+61", country: "AU" },
  { code: "+49", country: "DE" },
  { code: "+33", country: "FR" },
  { code: "+81", country: "JP" },
  { code: "+86", country: "CN" },
  { code: "+55", country: "BR" },
  { code: "+52", country: "MX" },
  { code: "+39", country: "IT" },
  { code: "+34", country: "ES" },
  { code: "+82", country: "KR" },
  { code: "+31", country: "NL" },
  { code: "+46", country: "SE" },
  { code: "+41", country: "CH" },
  { code: "+65", country: "SG" },
  { code: "+971", country: "AE" },
  { code: "+966", country: "SA" },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const CountryCodeSelect = ({ value, onChange, className }: CountryCodeSelectProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className || "w-[110px]"}>
        <SelectValue placeholder="Code" />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((c) => (
          <SelectItem key={`${c.country}-${c.code}`} value={`${c.country}:${c.code}`}>
            <span className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">{c.country}</span>
              <span className="text-sm">{c.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

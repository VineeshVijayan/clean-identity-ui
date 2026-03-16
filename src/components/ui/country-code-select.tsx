import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const countryCodes = [
  { code: "+1", country: "US", flag: "🇺🇸" },
  { code: "+1", country: "CA", flag: "🇨🇦" },
  { code: "+44", country: "GB", flag: "🇬🇧" },
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+86", country: "CN", flag: "🇨🇳" },
  { code: "+55", country: "BR", flag: "🇧🇷" },
  { code: "+52", country: "MX", flag: "🇲🇽" },
  { code: "+39", country: "IT", flag: "🇮🇹" },
  { code: "+34", country: "ES", flag: "🇪🇸" },
  { code: "+82", country: "KR", flag: "🇰🇷" },
  { code: "+31", country: "NL", flag: "🇳🇱" },
  { code: "+46", country: "SE", flag: "🇸🇪" },
  { code: "+41", country: "CH", flag: "🇨🇭" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+971", country: "AE", flag: "🇦🇪" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
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
              <span>{c.flag}</span>
              <span className="text-xs text-muted-foreground">{c.country}</span>
              <span className="text-sm">{c.code}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

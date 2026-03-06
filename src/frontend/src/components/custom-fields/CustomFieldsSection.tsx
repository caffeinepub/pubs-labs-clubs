import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  type SectionId,
  usePortalSettings,
} from "../../contexts/PortalSettingsContext";

interface CustomFieldsSectionProps {
  sectionId: SectionId;
  values: Record<string, string>;
  onChange: (fieldId: string, value: string) => void;
}

export default function CustomFieldsSection({
  sectionId,
  values,
  onChange,
}: CustomFieldsSectionProps) {
  const { customFields } = usePortalSettings();
  const fields = customFields[sectionId] ?? [];

  if (fields.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Separator className="flex-1" />
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider whitespace-nowrap">
          Custom Fields
        </span>
        <Separator className="flex-1" />
      </div>

      {fields.map((field, idx) => (
        <div key={field.id} className="space-y-1">
          <Label
            htmlFor={`cf-field-${field.id}`}
            className="text-sm font-medium"
          >
            {field.label}
            {field.required && (
              <span className="ml-1 text-xs text-muted-foreground font-normal">
                (required)
              </span>
            )}
          </Label>

          {field.type === "dropdown" ? (
            <Select
              value={values[field.id] ?? ""}
              onValueChange={(v) => onChange(field.id, v)}
            >
              <SelectTrigger
                id={`cf-field-${field.id}`}
                data-ocid={`custom_fields_section.field_input.${idx + 1}`}
              >
                <SelectValue placeholder={`Select ${field.label}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options.map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id={`cf-field-${field.id}`}
              type={
                field.type === "number"
                  ? "number"
                  : field.type === "date"
                    ? "date"
                    : "text"
              }
              value={values[field.id] ?? ""}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.label}
              data-ocid={`custom_fields_section.field_input.${idx + 1}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

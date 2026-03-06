import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import {
  type CustomFieldType,
  type SectionId,
  usePortalSettings,
} from "../../contexts/PortalSettingsContext";

const SECTION_TABS: { id: SectionId; label: string }[] = [
  { id: "memberships", label: "Memberships" },
  { id: "publishing", label: "Publishing" },
  { id: "releases", label: "Releases" },
  { id: "recordings", label: "Recordings" },
  { id: "artists", label: "Artist Dev" },
];

const FIELD_TYPE_LABELS: Record<CustomFieldType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  dropdown: "Dropdown",
};

const FIELD_TYPE_COLORS: Record<CustomFieldType, string> = {
  text: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
  number: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  date: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  dropdown: "bg-purple-500/15 text-purple-600 dark:text-purple-400",
};

export default function CustomFieldsPanel() {
  const { customFields, addCustomField, removeCustomField } =
    usePortalSettings();

  const [activeTab, setActiveTab] = useState<SectionId>("memberships");
  const [newLabel, setNewLabel] = useState("");
  const [newType, setNewType] = useState<CustomFieldType>("text");
  const [newOptions, setNewOptions] = useState("");
  const [newRequired, setNewRequired] = useState(false);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    const options =
      newType === "dropdown"
        ? newOptions
            .split(",")
            .map((o) => o.trim())
            .filter(Boolean)
        : [];
    addCustomField(activeTab, {
      label: newLabel.trim(),
      type: newType,
      options,
      required: newRequired,
    });
    setNewLabel("");
    setNewOptions("");
    setNewRequired(false);
  };

  return (
    <div className="space-y-4">
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as SectionId)}
      >
        <TabsList className="w-full flex-wrap h-auto gap-1">
          {SECTION_TABS.map((tab, idx) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex-1 text-xs"
              data-ocid={`custom_fields.section_tab.${idx + 1}`}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {SECTION_TABS.map((tab) => {
          const fields = customFields[tab.id] ?? [];
          return (
            <TabsContent key={tab.id} value={tab.id} className="mt-4 space-y-4">
              {/* Existing fields list */}
              {fields.length === 0 ? (
                <div
                  className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center"
                  data-ocid="custom_fields.empty_state"
                >
                  <p className="text-sm text-muted-foreground">
                    No custom fields for this section yet.
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/60">
                    Add your first field below.
                  </p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {fields.map((field, idx) => (
                    <li
                      key={field.id}
                      className="flex items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
                      data-ocid={`custom_fields.field_item.${idx + 1}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">
                            {field.label}
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${FIELD_TYPE_COLORS[field.type]}`}
                          >
                            {FIELD_TYPE_LABELS[field.type]}
                          </span>
                          {field.required && (
                            <span className="inline-flex items-center rounded-full bg-destructive/15 px-2 py-0.5 text-[10px] font-medium text-destructive">
                              Required
                            </span>
                          )}
                          {field.type === "dropdown" &&
                            field.options.length > 0 && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[12rem]">
                                {field.options.join(", ")}
                              </span>
                            )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 flex-shrink-0 text-muted-foreground hover:text-destructive"
                        onClick={() => removeCustomField(tab.id, field.id)}
                        data-ocid={`custom_fields.remove_field_button.${idx + 1}`}
                        title={`Remove ${field.label}`}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              {/* Add field form */}
              <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Add New Field
                </p>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Label */}
                  <div className="space-y-1 sm:col-span-2">
                    <Label
                      htmlFor="cf-label-input"
                      className="text-xs text-muted-foreground"
                    >
                      Field Label
                    </Label>
                    <Input
                      id="cf-label-input"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      placeholder="e.g. Genre, Contract Type…"
                      className="h-8 text-sm"
                      data-ocid="custom_fields.label_input"
                      onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    />
                  </div>

                  {/* Type */}
                  <div className="space-y-1">
                    <Label
                      htmlFor="cf-type-select"
                      className="text-xs text-muted-foreground"
                    >
                      Field Type
                    </Label>
                    <Select
                      value={newType}
                      onValueChange={(v) => setNewType(v as CustomFieldType)}
                    >
                      <SelectTrigger
                        id="cf-type-select"
                        className="h-8 text-sm"
                        data-ocid="custom_fields.type_select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Required toggle */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Required
                    </Label>
                    <div className="flex items-center gap-2 h-8">
                      <Switch
                        checked={newRequired}
                        onCheckedChange={setNewRequired}
                        data-ocid="custom_fields.required_switch"
                      />
                      <span className="text-xs text-muted-foreground">
                        {newRequired ? "Yes" : "No"}
                      </span>
                    </div>
                  </div>

                  {/* Dropdown options — only shown when type is dropdown */}
                  {newType === "dropdown" && (
                    <div className="space-y-1 sm:col-span-2">
                      <Label
                        htmlFor="cf-options-textarea"
                        className="text-xs text-muted-foreground"
                      >
                        Options (comma-separated)
                      </Label>
                      <Textarea
                        id="cf-options-textarea"
                        value={newOptions}
                        onChange={(e) => setNewOptions(e.target.value)}
                        placeholder="Option A, Option B, Option C"
                        className="text-sm min-h-[3rem] resize-none"
                        data-ocid="custom_fields.options_textarea"
                      />
                      {newOptions && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {newOptions
                            .split(",")
                            .map((o) => o.trim())
                            .filter(Boolean)
                            .map((opt) => (
                              <Badge
                                key={opt}
                                variant="secondary"
                                className="text-[10px]"
                              >
                                {opt}
                              </Badge>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    size="sm"
                    onClick={handleAdd}
                    disabled={!newLabel.trim()}
                    data-ocid="custom_fields.add_field_button"
                  >
                    Add Field
                  </Button>
                </div>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}

import * as React from "react";
import { Loader2, Check } from "lucide-react";
import { useQueries } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getTags } from "../api/get-tags";
import { Tag } from "@/types/api";
import { useController } from "react-hook-form";
import { Badge } from "@/components/ui/badge";

type TagComboboxProps = {
  name: string; // Field name for react-hook-form
  multiple?: boolean; // Toggle for single/multiple select
};

export function TagCombobox({ name, multiple = true }: TagComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedTags, setSelectedTags] = React.useState<Tag[]>([]);

  const queries = useQueries({
    queries: [{ queryKey: ["tags"], queryFn: getTags }],
  });

  const [tagsQuery] = queries;

  const {
    field, // field props from react-hook-form
    fieldState: { error }, // error state for validation
    formState: { isSubmitting }
  } = useController({
    name,
    rules: { required: "Issue Type is required" },
  });

  const toggleTagSelection = (tag: Tag) => {
    if (multiple) {
      setSelectedTags((prev) => {
        const alreadySelected = prev.some((t) => t.id === tag.id);
        const updatedTags = alreadySelected
          ? prev.filter((t) => t.id !== tag.id) // Remove if already selected
          : [...prev, tag]; // Add if not selected

        // Update form value with selected tag ids
        field.onChange(updatedTags.map((t) => t.id));
        return updatedTags;
      });
    } else {
      setSelectedTags([tag]);
      field.onChange(tag.id); // Single selection, update form value with the tag id
      setOpen(false); // Close the popover after selection
    }
  };

  const isTagSelected = (tagId: string) =>
    selectedTags.some((tag) => tag.id === tagId);

  // Initialize selected tags from the `field.value` provided by react-hook-form
  React.useEffect(() => {
    if (field.value) {
      const valueArray = Array.isArray(field.value) ? field.value : [field.value];
      setSelectedTags(tagsQuery.data?.data.filter((tag: Tag) =>
        valueArray.includes(tag.id)
      ) || []);
    }
  }, [tagsQuery.data, field.value]);

  return (
    <div className="flex flex-col gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start"
          >
            {selectedTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {selectedTags.map((tag) => (
                  <>
                    <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                        ></span>
                    <span>{tag.name}</span>
                  </>
                ))}
              </div>
            ) : (
              <>+ Select Issue Types</>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="p-0" side="bottom" align="start">
          {tagsQuery.isPending ? (
            <div className="flex items-center justify-center p-4">
              <Loader2 className="animate-spin h-6 w-6" />
            </div>
          ) : (
            <Command>
              <CommandInput placeholder="Search tags..." />
              <CommandList>
                <CommandEmpty>No tags found.</CommandEmpty>
                <CommandGroup>
                  {tagsQuery.data?.data?.map((tag: Tag) => (
                    <CommandItem
                      key={tag.id}
                      onSelect={() => toggleTagSelection(tag)}
                      className="flex items-center space-x-2"
                    >
                      <span
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      ></span>
                      <span>{tag.name}</span>
                      {isTagSelected(tag.id) && (
                        <Check className="ml-auto h-4 w-4 text-primary" />
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>

      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}

import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useGuestUserStore from "@/store/useGuestUser";

export function GuestUserInputs() {
  const { name, email, setName, setEmail } = useGuestUserStore();
  const formContext = useFormContext(); // Check if inside a form
  const control = formContext?.control;
  const setValue = formContext?.setValue;

  useEffect(() => {
    if (setValue) {
      setValue("name", name);
      setValue("email", email);
    }
  }, [name, email, setValue]);

  return (
    <div className="flex space-x-4">
      {control ? (
        <>
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Name"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setName(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="email"
                    placeholder="Email"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      setEmail(e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      ) : (
        // If NOT inside react-hook-form, use standalone inputs
        <>
          <div className="flex-grow">
            <label className="block text-sm font-medium">Name</label>
            <Input
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="flex-grow">
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

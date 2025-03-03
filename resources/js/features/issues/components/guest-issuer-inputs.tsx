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
import useGuestIssuerStore from "@/store/useGuestIssuer";
import useAuth from "@/store/useAuth";

export function GuestIssuerInputs() {
  const { authenticated, user } = useAuth();
  const guest = useGuestIssuerStore();
  const formContext = useFormContext(); // Check if inside a form
  const control = formContext?.control;
  const setValue = formContext?.setValue;

  useEffect(() => {
    if(authenticated && user){
      guest.setName(user.name);
      guest.setEmail(user.email);
    }

    if (control) {
      setValue("name", user.name);
      setValue("email", user.email);
    }
  }, [control])

  useEffect(() => {
    if (control) {
      setValue("name", guest.name);
      setValue("email", guest.email);
    }
  }, [guest.name, guest.email, control]);

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
                      guest.setName(e.target.value);
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
                    type="guest.email"
                    placeholder="Email"
                    value={field.value || ""}
                    onChange={(e) => {
                      field.onChange(e.target.value);
                      guest.setEmail(e.target.value);
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
              value={guest.name}
              onChange={(e) => guest.setName(e.target.value)}
            />
          </div>
          <div className="flex-grow">
            <label className="block text-sm font-medium">Email</label>
            <Input
              type="guest.email"
              placeholder="Email"
              value={guest.email}
              onChange={(e) => guest.setEmail(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  );
}

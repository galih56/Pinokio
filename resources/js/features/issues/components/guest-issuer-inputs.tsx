"use client"

import { Input } from "@/components/ui/input"
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useEffect, useCallback, useMemo } from "react"
import { useFormContext } from "react-hook-form"
import useGuestIssuerStore from "@/store/useGuestIssuer"
import useAuth from "@/store/useAuth"
import debounce from "lodash/debounce"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

const guestIssuerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
})

export function GuestIssuerInputs() {
  const { authenticated, user } = useAuth()
  const { name, email, setName, setEmail } = useGuestIssuerStore()

  const formContext = useFormContext()
  const control = formContext?.control
  const setValue = formContext?.setValue

  const debouncedSetName = useMemo(() => debounce(setName, 100), [setName])
  const debouncedSetEmail = useMemo(() => debounce(setEmail, 100), [setEmail])

  useEffect(() => {
    return () => {
      debouncedSetName.cancel()
      debouncedSetEmail.cancel()
    }
  }, [debouncedSetName, debouncedSetEmail])

  useEffect(() => {
    if (authenticated && user) {
      debouncedSetName(user.name)
      debouncedSetEmail(user.email)

      if (setValue) {
        setValue("name", user.name)
        setValue("email", user.email)
      }
    }
  }, [authenticated, user, setValue, debouncedSetName, debouncedSetEmail])

  const handleChange = (field: "name" | "email", value: string) => {
    if (field === "name") debouncedSetName(value)
    else debouncedSetEmail(value)

    if (setValue) {
      setValue(field, value, { shouldValidate: true })
    }
  }

  return (
    <div className="flex space-x-4">
      {control ? (
        <>
          {(["name", "email"] as const).map((field) => (
            <FormField
              key={field}
              control={control}
              name={field}
              render={({ field: formField }) => (
                <FormItem className="flex-grow">
                  <FormLabel>{field.charAt(0).toUpperCase() + field.slice(1)}</FormLabel>
                  <FormControl>
                    <Input
                      {...formField}
                      type={field === "email" ? "email" : "text"}
                      placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                      value={formField.value || ""}
                      onChange={(e) => {
                        formField.onChange(e)
                        handleChange(field, e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </>
      ) : (
        <>
          {(["name", "email"] as const).map((field) => (
            <div key={field} className="flex-grow">
              <label className="block text-sm font-medium">{field.charAt(0).toUpperCase() + field.slice(1)}</label>
              <Input
                type={field === "email" ? "email" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={field === "name" ? name : email}
                onChange={(e) => handleChange(field, e.target.value)}
              />
            </div>
          ))}
        </>
      )}
    </div>
  )
}

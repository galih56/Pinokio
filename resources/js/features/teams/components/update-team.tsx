import { Loader2, Pen } from 'lucide-react';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Button } from '@/components/ui/button';
import { useNotifications } from '@/components/ui/notifications';
import { Authorization, ROLES } from '@/lib/authorization';
import { useTeam } from '../api/get-team';
import {
  updateTeamInputSchema,
  useUpdateTeam,
} from '../api/update-team';
import { useIsFetching } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from "zod";
import { DialogFooter } from '@/components/ui/dialog';
import { CirclePicker } from 'react-color';
import { ColorPickerPopover } from '@/components/ui/color-picker-popover';
import { Checkbox } from '@/components/ui/checkbox';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

type UpdateTeamProps = {
  teamId: string;
  onSuccess? : ( ) => void;
  onError? : ( ) => void;
};

export const UpdateTeam = ({ teamId , onSuccess, onError}: UpdateTeamProps) => {
  const { addNotification } = useNotifications();

  const teamQuery = useTeam({ teamId });
  const updateTeamMutation = useUpdateTeam({
    teamId : teamId,
    config: {
      onSuccess: onSuccess,
      onError: onError,
    },
  });

  const team = teamQuery.data?.data;

  const form = useForm<z.infer<typeof updateTeamInputSchema>>({
    resolver: zodResolver(updateTeamInputSchema),
    defaultValues: {
      name: team?.name,        // Set default value for name
      color: team?.color || '#ffffff', // Set default color (fallback to white)
    },
  });

  useEffect(() => {
    if (team) {
      form.reset({
        name: team?.name || "",
        color: team?.color || "#ffffff",
        isPublic: Boolean(team?.isPublic),
      });
    }
  }, [team, form.reset]);

  async function onSubmit(values: z.infer<typeof updateTeamInputSchema>) {
    const isValid = await form.trigger();
    if (!isValid) {
      addNotification({
        type: 'error',
        title: 'Required fields are empty',
        toast: true
      });
      return;
    }
    updateTeamMutation.mutate({ data: values, teamId: team?.id! });
  }

  if(teamQuery.isPending){
    return (
      <div className="flex h-48 w-full items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!team) {
    return null;
  }
  
  return (
    <Authorization allowedRoles={[ROLES.ADMIN]}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-2'>
          <div className='space-x-2'>
              <b>Code :</b> 
              <span className='text-gray-700'>{team.code}</span>
          </div>
          {/* Name Field */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Color Picker Field */}
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem className="mt-4 flex items-center space-x-4 space-y-0">
              <FormLabel className="whitespace-nowrap">Choose a Team Color : </FormLabel>
                <FormControl>
                  <ColorPickerPopover
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="my-4">
            <Button type="submit" isLoading={updateTeamMutation.isPending}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </Authorization>
  );
};

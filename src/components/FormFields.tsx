// TODO: Consider refactoring to accept `name` as a prop (name: Path<T>) instead of hardcoding it
// inside each component. That approach lets TypeScript verify the field name at the call site
// (no `as Path<T>` cast needed) and makes components more reusable across different form schemas.
// Requires updating all call sites: LoginForm, SignupForm, ReservationCreateModal.
import { type Control, type FieldValues, type Path } from "react-hook-form";
import { FormField, FormControl, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function DateFormField<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <>
      <FormField
        control={control}
        name={"date" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} min={format(new Date(), "yyyy-MM-dd")} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function TimeFormField<T extends FieldValues>({ control }: { control: Control<T> }) {
  // Generate time slots (12:00 to 23:00, every 30 mins)
  const timeSlots: string[] = [];
  for (let h = 12; h <= 23; h++) {
    timeSlots.push(`${h.toString().padStart(2, "0")}:00`);
    timeSlots.push(`${h.toString().padStart(2, "0")}:30`);
  }
  return (
    <>
      <FormField
        control={control}
        name={"time" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Time</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-50">
                {timeSlots.map((time) => (
                  <SelectItem key={time} value={time}>
                    {time}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function PersonsFormField<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <>
      <FormField
        control={control}
        name={"people" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Persons</FormLabel>
            <FormControl>
              <Input type="number" min={1} max={20} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

interface NameFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: "firstname" | "lastname";
}

export function NameFormField<T extends FieldValues>({ control, name }: NameFormFieldProps<T>) {
  const label = name === "firstname" ? "First Name" : "Last Name";
  const placeholder = name === "firstname" ? "John" : "Doe";
  return (
    <>
      <FormField
        control={control}
        name={name as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>{label}</FormLabel>
            <FormControl>
              <Input placeholder={placeholder} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function EmailFormField<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <>
      <FormField
        control={control}
        name={"email" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input placeholder="m@example.com" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function PasswordFormField<T extends FieldValues>({ control }: { control: Control<T> }) {
  return (
    <>
      <FormField
        control={control}
        name={"password" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

export function ConfirmPasswordFormField<T extends FieldValues>({
  control,
}: {
  control: Control<T>;
}) {
  return (
    <>
      <FormField
        control={control}
        name={"confirmPassword" as Path<T>}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirm Password</FormLabel>
            <FormControl>
              <Input type="password" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

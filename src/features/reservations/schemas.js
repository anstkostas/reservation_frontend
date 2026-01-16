import * as z from "zod";

export const formSchema = z.object({
  date: z.string().refine((val) => new Date(val) >= new Date(new Date().setHours(0, 0, 0, 0)), {
    message: "Date cannot be in the past",
  }),
  time: z.string().min(1, "Please select a time"),
  persons: z.coerce.number().min(1, "At least 1 person").max(20, "Max 20 people"),
});

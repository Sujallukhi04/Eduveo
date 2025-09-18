import * as z from "zod";

export const sessionFormSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(50, "Title must be less than 50 characters")
    .nonempty("Title is required"),
  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must be less than 500 characters")
    .nonempty("Description is required"),
  date: z.date({
    required_error: "Please select a date",
    invalid_type_error: "Please select a valid date",
  }).min(new Date(), "Session date cannot be in the past"),
  time: z.string()
    .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Please select a valid time")
    .nonempty("Please select a time"),
  prerequisites: z.string().optional(),
});

export type SessionFormValues = z.infer<typeof sessionFormSchema>; 
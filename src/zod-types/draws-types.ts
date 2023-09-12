import { z } from "zod";

export const NewDrawSchema = z.object({
  game_number: z.union([z.number(), z.undefined()]),
  timestamp: z.union([z.date(), z.null(), z.undefined()]),
  numbers_drawn: z.unknown(), // You can use z.unknown() if you don't want to specify a type
});

export const DrawSchema = z.object({
  game_number: z.number(),
  timestamp: z.nullable(z.date()), // Use z.nullable() for fields that can be null
  numbers_drawn: z.unknown(), // You can use z.unknown() if you don't want to specify a specific type
});

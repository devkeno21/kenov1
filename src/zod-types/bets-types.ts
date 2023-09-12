import { z } from "zod";

import { Bet, NewBet } from "~/db/schema";

export const NewBetSchema = z.object({
  ticket_number: z.number().optional(),
  wager_amount: z.number().nullable().optional(),
  odds: z.number().nullable().optional(),
  game_number: z.number().nullable().optional(),
  hits: z.number().nullable().optional(),
  is_redeemed: z.boolean().optional(),
  redeemed_amount: z.number().optional(),
  timestamp: z.date().optional(),
});

export const BetSchema = z.object({
  ticket_number: z.number(),
  wager_amount: z.union([z.number(), z.null()]),
  odds: z.union([z.number(), z.null()]),
  game_number: z.union([z.number(), z.null()]),
  hits: z.union([z.number(), z.null()]),
  timestamp: z.union([z.instanceof(Date), z.null()]),
  is_redeemed: z.union([z.boolean(), z.null()]),
  redeemed_amount: z.union([z.number(), z.null()]),
});

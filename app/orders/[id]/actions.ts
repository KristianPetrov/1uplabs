"use server";

import { z } from "zod";

import { sendPaymentInstructionsEmail } from "@/app/lib/orderEmails";

export async function sendPaymentInstructionsForOrder (orderId: string): Promise<{ result: "sent" | "already-sent" | "skipped-no-provider" | "failed" }>
{
  const id = z.string().uuid().parse(orderId);
  const result = await sendPaymentInstructionsEmail(id);
  return { result };
}

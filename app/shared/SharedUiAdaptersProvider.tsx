"use client";

import type { ReactNode } from "react";
import { getSession, signIn, useSession } from "next-auth/react";

import { SharedUiAdapterProvider } from "@ap/shared-ui/adapters";

function unsupportedActionResult(actionName: string) {
  return {
    success: false as const,
    error: `${actionName} is not configured in 1UpLabs shared adapters yet.`,
  };
}

type SharedUiAdaptersProviderProps = {
  children: ReactNode;
};

export function SharedUiAdaptersProvider({
  children,
}: SharedUiAdaptersProviderProps) {
  return (
    <SharedUiAdapterProvider
      adapters={{
        support: {
          phoneDisplay: "+1 (307) 202-5965",
          smsLink: "sms:+13072025965",
        },
        auth: {
          useSession,
          signIn,
          getSession,
        },
        customerActions: {
          registerCustomer: async () =>
            unsupportedActionResult("registerCustomer"),
          updateCustomerProfile: async () =>
            unsupportedActionResult("updateCustomerProfile"),
          changePassword: async () => unsupportedActionResult("changePassword"),
          requestPasswordReset: async () =>
            unsupportedActionResult("requestPasswordReset"),
          resetPasswordWithToken: async () =>
            unsupportedActionResult("resetPasswordWithToken"),
        },
        orderActions: {
          createOrder: async () => ({
            success: false as const,
            error: "createOrder is not configured in 1UpLabs shared adapters yet.",
            errorCode: "UNKNOWN" as const,
          }),
          lookupOrder: async () => ({
            success: false as const,
            error: "lookupOrder is not configured in 1UpLabs shared adapters yet.",
          }),
          submitOrderStatusForm: async (prevState, formData) => {
            const orderIdEntry = formData.get("orderId");
            const statusEntry = formData.get("status");
            const fallbackOrderId =
              typeof orderIdEntry === "string"
                ? orderIdEntry
                : prevState?.orderId ?? "";
            const fallbackStatus =
              typeof statusEntry === "string" &&
              ["PENDING_PAYMENT", "PAID", "SHIPPED", "CANCELLED"].includes(
                statusEntry
              )
                ? (statusEntry as
                    | "PENDING_PAYMENT"
                    | "PAID"
                    | "SHIPPED"
                    | "CANCELLED")
                : prevState?.status ?? "PENDING_PAYMENT";

            return {
              orderId: fallbackOrderId,
              status: fallbackStatus,
              success: false,
              error:
                "submitOrderStatusForm is not configured in 1UpLabs shared adapters yet.",
            };
          },
          deleteOrder: async () => ({
            success: false as const,
            error: "deleteOrder is not configured in 1UpLabs shared adapters yet.",
          }),
        },
        referralActions: {
          applyReferralCode: async () => ({
            status: "error" as const,
            message:
              "applyReferralCode is not configured in 1UpLabs shared adapters yet.",
          }),
        },
      }}
    >
      {children}
    </SharedUiAdapterProvider>
  );
}

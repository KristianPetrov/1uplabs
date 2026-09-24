import type { Metadata } from "next";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata ({ params }: Props): Promise<Metadata>
{
  const { id } = await params;
  return {
    title: `Order ${id.slice(0, 8)}`,
    alternates: { canonical: `/orders/${id}` },
    robots: { index: false, follow: false },
  };
}

export default async function ThankYouOrderPage ({ params }: Props)
{
  const { id } = await params;
  redirect(`/orders/${id}`);
}

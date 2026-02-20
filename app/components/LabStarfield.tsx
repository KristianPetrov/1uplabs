"use client";

import dynamic from "next/dynamic";

const Starfield = dynamic(() => import("./Starfield"), { ssr: false });

export default function LabStarfield ({ className }: { className?: string })
{
  return <Starfield className={className} />;
}


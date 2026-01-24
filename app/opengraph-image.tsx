import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const alt = "1UpLabs — Research Peptides";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const SOURCE_IMAGE = path.join(
  process.cwd(),
  "public",
  "1uplabs-mushroom-molecule.png",
);

let cachedDataUrl: string | null = null;

async function getSourceDataUrl (): Promise<string>
{
  if (cachedDataUrl) return cachedDataUrl;
  const buf = await fs.readFile(SOURCE_IMAGE);
  cachedDataUrl = `data:image/png;base64,${buf.toString("base64")}`;
  return cachedDataUrl;
}

export default async function OpenGraphImage ()
{
  const src = await getSourceDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="1UpLabs"
          width={size.width}
          height={size.height}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    ),
    size,
  );
}



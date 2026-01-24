import { ImageResponse } from "next/og";
import fs from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

export const size = {
  width: 96,
  height: 96,
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

export default async function Icon ()
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
          overflow: "hidden",
          borderRadius: 6,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt="1UpLabs"
          width={96}
          height={96}
          style={{ objectFit: "cover" }}
        />
      </div>
    ),
    size,
  );
}




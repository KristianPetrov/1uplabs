import Image from "next/image";
import MoleculeViewer from "./components/MoleculeViewer";
import { getMoleculesForProduct } from "@/app/lib/molecules";

export default function Home ()
{
  const products: Array<{
    name: string;
    amount: string;
    moleculeKey: string;
  }> = [
      { name: "Semaglutide", amount: "5mg", moleculeKey: "Semaglutide" },
      { name: "Semaglutide", amount: "10mg", moleculeKey: "Semaglutide" },
      { name: "Tirzepatide", amount: "30mg", moleculeKey: "Tirzepatide" },
      { name: "Retatrutide", amount: "10mg", moleculeKey: "Retatrutide" },
      { name: "BPC-157", amount: "10mg", moleculeKey: "BPC-157" },
      { name: "TB-500", amount: "10mg", moleculeKey: "TB-500" },
      { name: "Mots-C", amount: "10mg", moleculeKey: "MOTS-C" },
      { name: "GHK-Cu", amount: "50mg", moleculeKey: "GHK-CU" },
      { name: "Ipamorelin", amount: "5mg", moleculeKey: "Ipamorelin" },
      {
        name: "CJC-1295 (no DAC)",
        amount: "5mg",
        moleculeKey: "CJC-1295",
      },
      { name: "Tesamorelin", amount: "10mg", moleculeKey: "Tesamorelin" },
      { name: "Epithalon", amount: "10mg", moleculeKey: "Epithalon" },
      { name: "Melanotan-II", amount: "10mg", moleculeKey: "Melanotan-II" },
      { name: "PT-141", amount: "10mg", moleculeKey: "PT-141" },
      { name: "NAD+", amount: "500mg", moleculeKey: "NAD+" },
      { name: "Glutathione", amount: "600mg", moleculeKey: "Glutathione" },
    ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-white/10">
              <Image
                src="/mushroom-peptide-logo.png"
                alt="1UpLabs mushroom peptide logo"
                fill
                sizes="36px"
                className="object-cover"
                priority
              />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide text-white">
                1UpLabs
              </div>
              <div className="text-xs text-white/60">Research peptides</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-200 sm:inline">
              Laboratory research only
            </span>
            <a
              href="#products"
              className="inline-flex items-center justify-center rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-500/20 ring-1 ring-red-400/30 transition hover:bg-red-400"
            >
              Browse products
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-red-500/20 blur-3xl" />
            <div className="absolute -bottom-64 right-[-10%] h-[520px] w-[520px] rounded-full bg-red-700/10 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_50%_0%,rgba(239,68,68,0.12),transparent_60%)]" />
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-2 lg:gap-14">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                Transparent. Tested. Reliable.
              </p>
              <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Level up your peptide research.
              </h1>
              <p className="mt-5 max-w-xl text-pretty text-base leading-7 text-white/70 sm:text-lg">
                Our mission at 1UpLabs is to provide researchers with reliable,
                high-quality peptide materials for laboratory research only,
                supported by transparency, testing, and integrity at every step.
                We aim to make peptide science more accessible, more organized,
                and more fun to explore—like hitting a 1-Up in the lab—while
                maintaining strict compliance and zero tolerance for misuse or
                medical claims.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="#products"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-red-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-red-500/20 ring-1 ring-red-400/30 transition hover:bg-red-400"
                >
                  View product list
                </a>
                <div className="text-sm text-white/55">
                  For laboratory research only. Not for human consumption.
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-red-500/15 via-transparent to-red-800/10 blur-xl" />
              <div className="relative overflow-hidden rounded-3xl border border-white/10 p-4">
                <div className="relative aspect-4/3 w-full overflow-hidden rounded-2xl">
                  <Image
                    src="/mushroom-peptide-logo.png"
                    alt="1UpLabs hero logo"
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 520px, 100vw"
                    priority
                  />
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div className="text-sm font-medium text-white">
                    1UpLabs — peptide store
                  </div>
                  <div className="text-xs text-white/60">
                    Black / red • clean inventory
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="products" className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Product list
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                A straightforward catalog view of currently listed items and
                vial strengths.
              </p>
            </div>
            <div className="text-xs text-white/55">
              Availability and COAs can be shown per-item in the next step.
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p, idx) => (
              (() =>
              {
                const molecules = getMoleculesForProduct(p.moleculeKey);

                // Skip products that don't have molecule data mapped yet.
                if (!molecules.length) return null;

                return (
                  <div
                    key={`${p.name}-${p.amount}-${idx}`}
                    className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-5 transition hover:border-red-500/30 hover:bg-white/6"
                  >
                    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-red-500/0 blur-2xl transition group-hover:bg-red-500/20" />
                    <div className="mb-4 h-40">
                      <MoleculeViewer
                        productName={p.moleculeKey}
                        molecules={molecules}
                        variant="hero"
                        className="h-full rounded-2xl"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold text-white">
                          {p.name}
                        </div>
                        <div className="mt-1 text-sm text-white/65">
                          Vial strength:{" "}
                          <span className="font-medium text-white">
                            {p.amount}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-200">
                        Research
                      </div>
                    </div>
                    <div className="mt-4 text-xs text-white/55">
                      Sold for laboratory research purposes only.
                    </div>
                  </div>
                );
              })()
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10">
          <div className="mx-auto max-w-6xl px-6 py-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm font-semibold text-white">1UpLabs</div>
              <div className="text-xs leading-5 text-white/60">
                Disclaimer: Products are intended for laboratory research only
                and are not for human consumption. No medical claims are made.
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts } from "@/app/lib/products";
import FeaturedCarousel from "@/app/components/FeaturedCarousel";

export default function Home ()
{
  const featured = getFeaturedProducts(3);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="relative h-9 w-9 overflow-hidden rounded-lg ring-1 ring-white/10">
              <Image
                src="/1uplabs-mushroom-molecule.png"
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
            <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-200 sm:inline">
              Laboratory research only
            </span>
            <Link
              href="/store"
              className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400"
            >
              Browse store
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -top-40 left-1/2 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-emerald-500/18 blur-3xl" />
            <div className="absolute -bottom-64 right-[-10%] h-[520px] w-[520px] rounded-full bg-sky-500/12 blur-3xl" />
            <div className="absolute inset-0 bg-[radial-gradient(900px_400px_at_50%_0%,rgba(16,185,129,0.12),transparent_60%)]" />
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 sm:py-20 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="relative mb-8 lg:hidden">
                <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-emerald-500/14 via-transparent to-sky-500/12 blur-xl" />

                <div className="relative aspect-4/3 w-full">
                  <div className="hero-fire" aria-hidden="true" />
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    <Image
                      src="/1uplabs-mushroom-molecule.png"
                      alt="1UpLabs hero logo"
                      fill
                      className="relative z-5 object-contain"
                      sizes="100vw"
                      priority
                    />
                  </div>
                </div>

              </div>

              <p className="inline-flex items-center gap-2 rounded-full border  bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
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
                <Link
                  href="/store"
                  className="inline-flex h-11 items-center justify-center rounded-full bg-emerald-500 px-6 text-sm font-semibold text-zinc-950 shadow-sm shadow-emerald-500/20 ring-1 ring-emerald-400/30 transition hover:bg-emerald-400"
                >
                  View store
                </Link>
                <div className="text-sm text-white/55">
                  For laboratory research only. Not for human consumption.
                </div>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-emerald-500/14 via-transparent to-sky-500/12 blur-xl" />
              <div className="relative rounded-3xl p-4">
                <div className="relative aspect-4/3 w-full">
                  <div className="hero-fire" aria-hidden="true" />
                  <div className="relative h-full w-full overflow-hidden rounded-2xl">
                    <Image
                      src="/1uplabs-mushroom-molecule.png"
                      alt="1UpLabs hero logo"
                      fill
                      className="relative z-5 object-contain"
                      sizes="(min-width: 1024px) 520px, 100vw"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-12 sm:py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Featured products
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65 sm:text-base">
                A quick look at what researchers are exploring right now.
              </p>
            </div>
            <Link
              href="/store#catalog"
              className="inline-flex w-fit items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:border-sky-500/30 hover:bg-white/8"
            >
              View full store
            </Link>
          </div>

          <FeaturedCarousel products={featured} href="/store#catalog" />
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

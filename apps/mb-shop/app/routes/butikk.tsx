import { SiteFooter } from "~/components/site-footer";
import { getCustomerSession } from "~/lib/session.server";
import type { WooProduct } from "~/lib/woo/types";
import { fetchPublishedProducts } from "~/lib/woo/products.server";
import type { Route } from "./+types/butikk";

const ABONNEMENT_NAMES = ["Kaffeabonnement", "Gaveabonnement"] as const;

export function meta({}: Route.MetaArgs) {
  return [{ title: "Butikk — Maridalen Brenneri" }];
}

export async function loader({ request }: Route.LoaderArgs) {
  const [customer, products] = await Promise.all([
    getCustomerSession(request),
    fetchPublishedProducts(),
  ]);

  const abonnement = ABONNEMENT_NAMES.map((name) =>
    products.find((product) => product.name === name)
  ).filter((product): product is WooProduct => Boolean(product));

  const abonnementIds = new Set(abonnement.map((product) => product.id));
  const kaffen = products.filter((product) => !abonnementIds.has(product.id));

  return {
    abonnement,
    kaffen,
    loggedIn: Boolean(customer),
  };
}

function formatPrice(price: string) {
  const amount = Number(price);
  if (!price || Number.isNaN(amount)) {
    return null;
  }
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
  }).format(amount);
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function ProductCard({ product }: { product: WooProduct }) {
  const image = product.images[0];
  const price = formatPrice(product.price || product.regular_price);
  const summary = stripHtml(product.short_description);

  return (
    <a
      href={product.permalink}
      target="_blank"
      rel="noreferrer"
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-stone-200 bg-white shadow-sm transition hover:border-accent/40 hover:shadow-md"
    >
      <div className="aspect-[4/3] overflow-hidden bg-stone-100">
        {image ? (
          <img
            src={image.src}
            alt={image.alt || product.name}
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-stone-400">
            Ingen bilde
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-xl text-brand">{product.name}</h3>
        {summary ? (
          <p className="line-clamp-2 text-sm text-stone-600">{summary}</p>
        ) : null}
        <div className="mt-auto flex items-baseline justify-between gap-2 pt-2 text-sm">
          <span className="font-semibold text-brand">{price ?? "Se pris"}</span>
          <span className="text-stone-500">
            {product.stock_status === "instock" ? "På lager" : "Ikke på lager"}
          </span>
        </div>
      </div>
    </a>
  );
}

function ProductSection({
  title,
  products,
  columnsClassName,
}: {
  title: string;
  products: WooProduct[];
  columnsClassName: string;
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-5">
      <h2 className="font-display text-2xl text-brand">{title}</h2>
      <ul className={`grid gap-6 ${columnsClassName}`}>
        {products.map((product) => (
          <li key={product.id}>
            <ProductCard product={product} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function Butikk({ loaderData }: Route.ComponentProps) {
  const { abonnement, kaffen, loggedIn } = loaderData;
  const empty = abonnement.length === 0 && kaffen.length === 0;

  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        <header className="mb-10">
          <p className="text-sm font-medium tracking-[0.2em] text-accent uppercase">
            Maridalen Brenneri
          </p>
          <h1 className="mt-2 font-display text-4xl text-brand md:text-5xl">
            Butikk
          </h1>
          <p className="mt-2 max-w-xl text-stone-600">
            Publiserte produkter fra nettbutikken.
          </p>
        </header>

        {empty ? (
          <p className="rounded-lg border border-dashed border-stone-300 px-6 py-12 text-center text-stone-600">
            Ingen produkter å vise akkurat nå.
          </p>
        ) : (
          <div className="space-y-12">
            <ProductSection
              title="Abonnement"
              products={abonnement}
              columnsClassName="sm:grid-cols-2"
            />
            <ProductSection
              title="Kaffen"
              products={kaffen}
              columnsClassName="sm:grid-cols-2 lg:grid-cols-3"
            />
          </div>
        )}
      </main>

      <SiteFooter loggedIn={loggedIn} />
    </div>
  );
}

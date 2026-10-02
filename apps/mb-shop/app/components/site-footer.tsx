import { Link } from "react-router";

type SiteFooterProps = {
  loggedIn?: boolean;
};

export function SiteFooter({ loggedIn = false }: SiteFooterProps) {
  return (
    <footer className="mt-auto border-t border-stone-200 py-8">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 text-sm text-stone-600">
        <p>Maridalen Brenneri</p>
        <nav className="flex gap-4">
          <Link to="/" className="hover:text-brand">
            Butikk
          </Link>
          {loggedIn ? (
            <Link to="/orders" className="hover:text-brand">
              Mine ordrer
            </Link>
          ) : (
            <Link to="/login" className="hover:text-brand">
              Logg inn
            </Link>
          )}
        </nav>
      </div>
    </footer>
  );
}

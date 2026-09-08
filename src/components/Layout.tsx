import { NavLink, Outlet } from "react-router-dom";
import { DisclaimerBanner } from "./DisclaimerBanner";
import { BackendStatusBanner } from "./BackendStatusBanner";

const NAV_LINKS = [
  { to: "/resources", label: "Find a Resource" },
  { to: "/guide", label: "Not Sure What I Need" },
  { to: "/help", label: "Chat or Call" },
];

function navLinkClass({ isActive }: { isActive: boolean }) {
  return [
    "rounded-md px-3 py-2 text-sm font-semibold",
    isActive
      ? "bg-primary-50 text-primary-700"
      : "text-ink-700 hover:bg-surface-muted hover:text-primary-600",
  ].join(" ");
}

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <BackendStatusBanner />
      <DisclaimerBanner />

      <header className="border-b border-ink-900/10 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <NavLink
            to="/"
            className="flex items-center gap-2 text-lg font-bold text-primary-700 no-underline"
          >
            <span aria-hidden="true">🏛️</span>
            <span>
              Civic Resource Hub
              <span className="block text-xs font-normal text-ink-500">
                Public and government services in Georgia
              </span>
            </span>
          </NavLink>

          <nav aria-label="Primary">
            <ul className="flex flex-wrap items-center gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.to}>
                  <NavLink to={link.to} className={navLinkClass} end>
                    {link.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-ink-900/10 bg-surface-muted">
        <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-ink-700">
          <nav aria-label="Footer">
            <ul className="mb-4 flex flex-wrap gap-x-6 gap-y-2">
              <li>
                <NavLink to="/about">About this site</NavLink>
              </li>
              <li>
                <NavLink to="/accessibility">Accessibility statement</NavLink>
              </li>
              <li>
                <a
                  href="https://988lifeline.org"
                  target="_blank"
                  rel="noreferrer"
                >
                  In crisis? Call or text 988
                </a>
              </li>
            </ul>
          </nav>
          <p>
            This site does not collect personal information from visitors
            using the guided help tool. See our{" "}
            <NavLink to="/accessibility">accessibility statement</NavLink>{" "}
            and <NavLink to="/about">about page</NavLink> for details.
          </p>
        </div>
      </footer>
    </div>
  );
}

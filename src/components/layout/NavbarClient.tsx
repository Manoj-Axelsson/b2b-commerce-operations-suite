"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

interface NavbarClientProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
}

// Builds the list of nav links based on auth state and role.
// Admin link is only included when the user has the admin role.
function buildLinks(isLoggedIn: boolean, isAdmin: boolean): NavLink[] {
  const links: NavLink[] = [{ href: "/shop", label: "Shop" }];

  if (isLoggedIn) {
    links.push({ href: "/account", label: "My Account" });
  } else {
    links.push({ href: "/login", label: "Sign In" });
  }

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin" });
  }

  return links;
}

// Returns true only when the current path matches or is under the given href.
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavbarClient({ isAdmin, isLoggedIn }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const links = buildLinks(isLoggedIn, isAdmin);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav
      id="main-navbar"
      className="sticky top-0 z-50 w-full bg-brand-primary shadow-lg"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Brand logo */}
          <Link
            href="/"
            id="navbar-logo"
            aria-label="Rajput Foods — go to homepage"
            className="flex items-center gap-1 group"
          >
            <span className="font-serif text-xl font-bold tracking-widest uppercase text-white group-hover:text-brand-gold transition-colors duration-200">
              Rajput
            </span>
            <span className="font-serif text-xl font-bold tracking-widest uppercase text-brand-gold">
              &nbsp;Foods
            </span>
          </Link>

          {/* Desktop navigation links */}
          <div className="hidden md:flex items-center gap-8">
            {links.map((link) => (
              <Link
                key={link.href}
                id={`navbar-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                href={link.href}
                className={cn(
                  "text-sm font-medium tracking-widest uppercase transition-colors duration-200 pb-1 border-b-2",
                  isActive(pathname, link.href)
                    ? "text-brand-gold border-brand-gold"
                    : "text-white/80 border-transparent hover:text-brand-gold hover:border-brand-gold/50"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger button */}
          <button
            id="navbar-mobile-menu-button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
            aria-controls="navbar-mobile-menu"
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-md text-white hover:text-brand-gold transition-colors duration-200"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMenuOpen && (
        <div
          id="navbar-mobile-menu"
          role="menu"
          className="md:hidden border-t border-white/10 bg-brand-primary"
        >
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                id={`navbar-mobile-link-${link.label.toLowerCase().replace(/\s+/g, "-")}`}
                href={link.href}
                role="menuitem"
                onClick={closeMenu}
                className={cn(
                  "block px-3 py-2.5 text-sm font-medium uppercase tracking-widest rounded-md transition-colors duration-200",
                  isActive(pathname, link.href)
                    ? "text-brand-gold bg-white/5"
                    : "text-white/80 hover:text-brand-gold hover:bg-white/5"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}

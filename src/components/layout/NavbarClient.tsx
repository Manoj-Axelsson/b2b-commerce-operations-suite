"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

interface NavLink {
  href: string;
  label: string;
}

interface Category {
  id: string;
  name: string;
}

interface NavbarClientProps {
  isAdmin: boolean;
  isLoggedIn: boolean;
  categories: Category[];
}

// Builds nav links based on auth state.
// Auth buttons (Sign In / Sign Up / Sign Out) are rendered separately.
function buildLinks(isLoggedIn: boolean, isAdmin: boolean): NavLink[] {
  const links: NavLink[] = [{ href: "/shop", label: "Shop" }];

  if (isLoggedIn) {
    links.push({ href: "/account", label: "My Account" });
  }

  if (isAdmin) {
    links.push({ href: "/admin", label: "Admin" });
  }

  return links;
}

// Returns true when the current path matches or is under the given href.
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavbarClient({ isAdmin, isLoggedIn, categories }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const pathname = usePathname();

  // Landing page has its own branded layout — no navbar rendered there
  if (pathname === "/") return null;

  const links = buildLinks(isLoggedIn, isAdmin);

  const closeMenu = () => setIsMenuOpen(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await authClient.signOut();
      // Use window.location for a full page reload to ensure 
      // all auth states are fully cleared across the app.
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out failed:", error);
      setIsSigningOut(false);
    }
  };

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

          {/* Desktop navigation */}
          <div className="hidden md:flex items-center gap-6">

            {/* Nav links — Shop gets a category dropdown, others are plain links */}
            {links.map((link) =>
              link.label === "Shop" ? (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => setIsShopOpen(true)}
                  onMouseLeave={() => setIsShopOpen(false)}
                >
                  {/* Shop link — also acts as dropdown trigger */}
                  <Link
                    id="navbar-link-shop"
                    href="/shop"
                    className={cn(
                      "flex items-center gap-1 text-sm font-medium tracking-widest uppercase transition-colors duration-200 pb-1 border-b-2",
                      isActive(pathname, link.href)
                        ? "text-brand-gold border-brand-gold"
                        : "text-white/80 border-transparent hover:text-brand-gold hover:border-brand-gold/50"
                    )}
                  >
                    Shop
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-70" aria-hidden="true">
                      <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
                    </svg>
                  </Link>

                  {/* Category dropdown panel */}
                  {isShopOpen && categories.length > 0 && (
                    <div
                      role="menu"
                      aria-label="Shop categories"
                      className="absolute top-full left-0 mt-1 w-52 bg-brand-primary border border-brand-gold/20 rounded-md shadow-xl py-1 z-50"
                    >
                      <Link
                        href="/shop"
                        role="menuitem"
                        onClick={() => setIsShopOpen(false)}
                        className="block px-4 py-2 text-xs font-bold text-brand-gold uppercase tracking-widest hover:bg-white/5 transition-colors"
                      >
                        All Products
                      </Link>
                      <div className="border-t border-brand-gold/20 my-1" />
                      {categories.map((cat) => (
                        <Link
                          key={cat.id}
                          href={`/shop?category=${cat.id}`}
                          role="menuitem"
                          onClick={() => setIsShopOpen(false)}
                          className="block px-4 py-2 text-sm text-white/80 hover:text-brand-gold hover:bg-white/5 transition-colors capitalize"
                        >
                          {cat.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
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
              )
            )}

            {/* Auth buttons */}
            {isLoggedIn ? (
              <button
                id="navbar-sign-out"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="text-sm font-medium tracking-widest uppercase px-4 py-1.5 rounded-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-primary transition-all duration-200 disabled:opacity-50"
              >
                {isSigningOut ? "Signing out…" : "Sign Out"}
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  id="navbar-log-in"
                  href="/login"
                  className="text-sm font-medium tracking-widest uppercase px-4 py-1.5 rounded-full border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-primary transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  id="navbar-register"
                  href="/signup"
                  className="text-sm font-medium tracking-widest uppercase px-4 py-1.5 rounded-full bg-brand-gold text-brand-primary hover:brightness-110 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
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

            {/* Nav links — Shop expands to show categories on mobile */}
            {links.map((link) => (
              <div key={link.href}>
                <Link
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

                {/* Category links nested under Shop */}
                {link.label === "Shop" && categories.length > 0 && (
                  <div className="pl-4 mt-1 space-y-1 border-l border-brand-gold/20 ml-3">
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/shop?category=${cat.id}`}
                        role="menuitem"
                        onClick={closeMenu}
                        className="block px-3 py-1.5 text-sm text-white/60 hover:text-brand-gold capitalize transition-colors"
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}


            {/* Mobile auth buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              {isLoggedIn ? (
                <button
                  id="navbar-mobile-sign-out"
                  onClick={() => { closeMenu(); handleSignOut(); }}
                  disabled={isSigningOut}
                  role="menuitem"
                  className="w-full text-left px-3 py-2.5 text-sm font-medium uppercase tracking-widest rounded-md text-brand-gold hover:bg-white/5 transition-colors duration-200 disabled:opacity-50"
                >
                  {isSigningOut ? "Signing out…" : "Sign Out"}
                </button>
              ) : (
                <>
                  <Link
                    id="navbar-mobile-log-in"
                    href="/login"
                    role="menuitem"
                    onClick={closeMenu}
                    className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest rounded-md text-brand-gold hover:bg-white/5 transition-colors duration-200"
                  >
                    Log In
                  </Link>
                  <Link
                    id="navbar-mobile-register"
                    href="/signup"
                    role="menuitem"
                    onClick={closeMenu}
                    className="block px-3 py-2.5 text-sm font-medium uppercase tracking-widest rounded-md bg-brand-gold text-brand-primary hover:brightness-110 transition-all duration-200"
                  >
                    Register
                  </Link>
                </>
              )}
            </div>

          </div>
        </div>
      )}
    </nav>
  );
}

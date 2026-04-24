import Image from "next/image";
import Hero from "@/components/layout/Hero";

// Landing page: light saffron background, centered logo above hero, no navbar.
// The Navbar is suppressed on "/" via NavbarClient's pathname check.
const Page = () => {
  return (
    // h-screen + overflow-hidden locks the page to exactly one viewport — no scroll.
    // justify-center places logo and hero in the vertical middle.
    <div className="h-screen overflow-hidden bg-brand-saffron flex flex-col items-center justify-start pt-4 gap-2 px-4">

      {/* Logo — height-constrained so it never overflows on any screen size */}
      <div className="flex justify-center">
        <Image
          src="/refactored_logo.webp"
          alt="Rajput Foods Logo"
          width={720}
          height={1280}
          priority
          className="mix-blend-multiply"
          style={{ height: "clamp(438px, 72vh, 831px)", width: "auto" }}
        />
      </div>

      {/* Hero — tagline and Enter CTA */}
      <Hero />

    </div>
  );
};

export default Page;

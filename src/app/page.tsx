import Image from "next/image";
import Hero from "@/components/layout/Hero";

// Landing page: light saffron background, centered logo above hero, no navbar.
// The Navbar is suppressed on "/" via NavbarClient's pathname check.
const Page = () => {
  return (
    <div className="min-h-screen bg-brand-saffron flex flex-col items-center justify-center px-4">

      {/* Logo — prominent and centered above the hero section */}
      <div className="flex justify-center mb-6">
        <div className="relative w-[clamp(160px,22vw,280px)]">
          <Image
            src="/refactored_logo.webp"
            alt="Rajput Foods Logo"
            width={720}
            height={1280}
            priority
            className="w-full h-auto drop-shadow-md"
          />
        </div>
      </div>

      {/* Hero — tagline and Enter CTA */}
      <Hero />

    </div>
  );
};

export default Page;

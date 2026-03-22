import Image from "next/image";
import Header from "@/components/layout/header";
import Hero from "@/components/layout/hero";

const Page = () => {
  return (
    <main className="relative min-h-screen w-full flex flex-col">
      {/* Bakgrundslager - Fixerat och blekt för "superimposed" effekt */}
      <div className="fixed inset-0 -z-10 bg-white">
        <Image
          src="/landing_bg.svg"
          alt="Rajput Heritage Artwork"
          fill
          priority
          className="object-cover opacity-30"
        />
      </div>

      {/* Innehållslager */}
      <div className="relative z-20 flex flex-col w-full">
        <Header />
        <Hero />
      </div>
    </main>
  );
};

export default Page;
import Image from "next/image";
import Header from "@/app/components/layout/header";
import Hero from "@/app/components/layout/hero";

const Page = () => {
  return (
    <main className="relative min-h-screen w-full flex flex-col">
      <div className="fixed inset-0 -z-10 bg-white">
        <Image
          src="/landing_bg.svg"
          alt="Rajput Heritage Artwork"
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-30"
        />
      </div>

      <div className="relative z-20 flex flex-col w-full">
        <Header />
        <Hero />
      </div>
    </main>
  );
};

export default Page;

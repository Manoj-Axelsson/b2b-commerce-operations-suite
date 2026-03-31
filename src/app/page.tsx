import Image from "next/image";
import Header from "@/components/layout/Header";
import Hero from "@/components/layout/Hero";

const Page = () => {
  return (
    <main className="relative h-dvh w-full flex flex-col overflow-hidden">
      <div className="fixed inset-0 -z-10 bg-white">
        <Image
          src="/landing_bg.svg"
          alt=""
          fill
          sizes="100vw"
          priority
          className="object-cover opacity-30"
        />
      </div>

      <div className="relative z-20 flex flex-col flex-1 w-full">
        <Header />
        <Hero />
      </div>
    </main>
  );
};

export default Page;

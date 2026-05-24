import Image from "next/image";
import Hero from "@/components/layout/Hero";

const Page = () => {
  return (
    // justify-start with pt-[5vh] pulls the entire layout slightly higher than absolute center
    <div className="relative h-screen overflow-hidden bg-brand-saffron flex flex-col items-center justify-start pt-[5vh] gap-4 px-4">
      
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/landing_bg.svg"
          alt="Background"
          fill
          priority
          className="object-cover opacity-30 select-none pointer-events-none"
        />
      </div>

      {/* Content Container (Logo + Hero) */}
      <div className="relative z-10 flex flex-col items-center w-full max-w-2xl scale-90 sm:scale-100">
        {/* Logo — Increased size by ~15% */}
        <div className="flex justify-center w-full">
          <Image
            src="/rajput_logo.png"
            alt="Rajput Foods Logo"
            width={1000}
            height={1000}
            priority
            className="mix-blend-screen brightness-[1.1] contrast-[1.1]"
            style={{ 
              height: "clamp(320px, 62vh, 800px)", 
              width: "auto",
              filter: "drop-shadow(0px 15px 40px rgba(0,0,0,0.6))"
            }}
          />
        </div>

        {/* Hero Container — Reduced size by 10% */}
        <div className="-mt-4 sm:-mt-8 scale-90 origin-top">
          <Hero />
        </div>
      </div>
    </div>
  );
};

export default Page;

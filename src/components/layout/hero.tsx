import Image from "next/image";
import { Button } from "@/components/ui/button";

const Hero = () => {
    return (
        <section className="relative min-h-screen w-full flex flex-col items-center text-center">
            <div className="fixed inset-[-5%] -z-10 bg-white overflow-hidden">
                <Image
                    src="/landing_bg.svg"
                    alt="Rajput Heritage Artwork"
                    fill
                    priority
                    className="object-cover opacity-30"
                />
            </div>

            <div className="flex flex-col items-center pt-16 md:pt-32 pb-40 max-w-[95vw]">
                <h2 className="text-lg font-bold md:text-2xl tracking-[0.25em] uppercase text-[#1c0a5c] mb-6">
                    Welcome To
                </h2>

                <h1 className="text-4xl font-bold md:text-5xl lg:text-7xl text-[#1c0a5c] mb-2 drop-shadow-xl leading-tight font-serif">
                    Rajput Foods Sweden
                </h1>

                <p className="text-[#1c0a5c] italic font-semibold mb-24 text-lg md:text-2xl max-w-4xl font-serif">
                    Quality you can trust. Service defined by integrity
                </p>

                <Button
                    size="lg"
                    className="rounded-full px-12 text-lg font-bold uppercase tracking-[0.3em] text-white bg-linear-to-r from-[#B8860B] via-[#D4AF37] to-[#B8860B] border-none hover:brightness-110 hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                >
                    Enter
                </Button>
            </div>
        </section>
    );
};

export default Hero;


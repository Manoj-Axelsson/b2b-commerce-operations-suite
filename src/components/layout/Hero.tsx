import Link from "next/link";
import { Button } from "@/components/ui/Button";

const Hero = () => {
    return (
        <section className="relative flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 z-20">
            <div className="flex flex-col items-center max-w-4xl">
                <h2 className="text-[clamp(0.75rem,1.5vw,1.125rem)] font-bold tracking-[0.25em] uppercase text-brand-primary mb-[1vh] sm:mb-[2vh]">
                    Welcome To
                </h2>

                <h1 className="text-[clamp(1.5rem,5vw,3.75rem)] text-brand-primary font-bold leading-tight font-serif mb-[1vh] sm:mb-[2vh]">
                    Rajput Foods Sweden
                </h1>

                <p className="text-foreground italic font-semibold text-[clamp(0.875rem,2vw,1.25rem)] max-w-2xl font-serif mb-[3vh] sm:mb-[5vh]">
                    Quality you can trust. Service defined by integrity
                </p>

                <Link href="/shop">
                    <Button
                        size="lg"
                        className="rounded-full px-[clamp(2rem,5vw,4rem)] py-[clamp(0.75rem,2vh,2rem)] text-[clamp(0.875rem,1.5vw,1.25rem)] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark hover:brightness-110 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark transition-all duration-300 shadow-lg border-none"
                    >
                        Enter
                    </Button>
                </Link>
            </div>
        </section>
    );
};

export default Hero;

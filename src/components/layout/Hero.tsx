import Link from "next/link";
import { Button } from "@/components/ui/Button";

const Hero = () => {
    return (
        <section className="relative flex flex-col items-center justify-center text-center px-4 sm:px-6 z-20">
            <div className="flex flex-col items-center max-w-4xl">
                <h2 className="text-[clamp(0.56rem,1.13vw,0.84rem)] font-bold tracking-[0.25em] uppercase text-brand-primary mb-[0.75vh] sm:mb-[1.5vh]">
                    Welcome To
                </h2>

                <h1 className="text-[clamp(1.13rem,3.75vw,2.81rem)] text-brand-primary font-bold leading-tight font-serif mb-[0.75vh] sm:mb-[1.5vh]">
                    Rajput Foods Sweden
                </h1>

                <p className="text-foreground italic font-semibold text-[clamp(0.66rem,1.5vw,0.94rem)] max-w-2xl font-serif mb-[2.25vh] sm:mb-[3.75vh]">
                    Quality you can trust. Service defined by integrity
                </p>

                <Link href="/shop">
                    <Button
                        size="lg"
                        className="rounded-full px-[clamp(1.5rem,3.75vw,3rem)] py-[clamp(0.56rem,1.5vh,1.5rem)] text-[clamp(0.66rem,1.13vw,0.94rem)] font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark hover:brightness-110 hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark transition-all duration-300 shadow-lg border-none"
                    >
                        Enter
                    </Button>
                </Link>
            </div>
        </section>
    );
};

export default Hero;

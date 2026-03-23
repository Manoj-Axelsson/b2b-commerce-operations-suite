import { Button } from "@/components/ui/Button";

const Hero = () => {
    return (
        <section className="relative flex-1 flex flex-col items-center text-center px-4 z-20">
            <div className="flex flex-col items-center pt-8 md:pt-12 pb-24 max-w-[95vw]">
                <h2 className="text-lg font-bold md:text-2xl tracking-[0.25em] uppercase text-brand-primary mb-6">
                    Welcome To
                </h2>

                <h1 className="text-4xl font-bold md:text-6xl lg:text-8xl text-brand-primary mb-4 drop-shadow-xl leading-tight font-serif">
                    Rajput Foods Sweden
                </h1>

                <p className="text-brand-primary italic font-semibold mb-16 text-lg md:text-2xl max-w-4xl font-serif">
                    Quality you can trust. Service defined by integrity
                </p>

                <Button
                    size="md"
                    className="rounded-full px-16 py-8 text-xl font-bold uppercase tracking-[0.4em] text-white bg-linear-to-r from-brand-gold-dark via-brand-gold to-brand-gold-dark hover:brightness-110 hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-gold-dark/40 border-none"
                >

                    Enter
                </Button>

            </div>
        </section >
    );
};

export default Hero;

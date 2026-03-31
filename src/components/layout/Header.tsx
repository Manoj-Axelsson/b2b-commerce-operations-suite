import Image from "next/image";

const Header = () => {
    return (
        <header className="relative w-full flex justify-center pt-[3vh] sm:pt-[4vh] md:pt-[5vh] z-20">
            <div className="relative w-[clamp(120px,30vw,400px)] aspect-square">
                <Image
                    src="/rajput_logo.svg"
                    alt="Rajput Foods Sweden - Home"
                    fill
                    sizes="(max-width: 640px) 30vw, (max-width: 1024px) 30vw, 400px"
                    priority
                    className="object-contain"
                />
            </div>
        </header>
    );
};

export default Header;

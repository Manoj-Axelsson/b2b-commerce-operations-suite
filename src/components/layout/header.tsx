import Image from "next/image";

const Header = () => {
    return (
        <header className="relative w-full flex justify-center pt-24 pb-12 z-20">
            <div className="relative w-[280px] md:w-[450px] aspect-square">
                <Image
                    src="/rajput_logo.svg"
                    alt="Rajput Foods Logo"
                    fill
                    priority

                    className="object-contain mix-blend-multiply"
                />
            </div>
        </header>
    );
};

export default Header;
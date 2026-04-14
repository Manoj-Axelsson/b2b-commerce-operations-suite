import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <header className="relative w-full flex justify-center pt-[2vh] sm:pt-[5vh] z-50">
            <Link
                href="/"
                className="relative w-[clamp(300px,75vw,800px)] aspect-square transition-transform hover:scale-[1.02] duration-500"
            >
                <Image
                    src="/rajput-logo.svg"
                    alt="Rajput Foods Sweden"
                    fill
                    sizes="(max-width: 768px) 75vw, 800px"
                    priority
                    className="object-contain"
                />
            </Link>
        </header>
    );
};

export default Header;
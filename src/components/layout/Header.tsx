import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        <header className="relative w-full flex justify-center pt-[10vh] sm:pt-[12vh] z-50 shrink-0">
            <Link
                href="/"
                className="transition-transform hover:scale-[1.02] duration-500"
            >
                <Link
                    href="/"
                    className="relative w-[clamp(340px,18vw,1400px)] aspect-square transition-transform hover:scale-[1.02] duration-500"
                >
                    <Image
                        src="/rajput_logo.webp"
                        alt="Rajput Foods Sweden"
                        fill
                        sizes="(max-width: 768px) 95vw, (max-width: 1200px) 60vw, 1400px"
                        priority
                        className="object-contain"
                    />
                </Link>
            </Link>
        </header>
    );
};

export default Header;
import Image from "next/image";
import Link from "next/link";

const Header = () => {
    return (
        // shrink-0 prevents Hero (flex-1) from squeezing the header out of the layout
        <header className="relative w-full flex justify-center pt-[10vh] sm:pt-[12vh] z-50 shrink-0">
            <Link
                href="/"
                className="transition-transform hover:scale-[1.02] duration-500"
            >
                <div
                    style={{
                        width: "clamp(160px, 20vw, 280px)",
                        height: "clamp(160px, 20vw, 280px)",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    <Image
                        src="/rajput_logo.webp"
                        alt="Rajput Foods Sweden"
                        fill
                        priority
                        sizes="(max-width: 768px) 60vw, 25vw"
                        style={{
                            objectFit: "contain",
                            transform: "scale(2.75)",
                            transformOrigin: "center 50%",
                        }}
                    />
                </div>
            </Link>
        </header>
    );
};

export default Header;
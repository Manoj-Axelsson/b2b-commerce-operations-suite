import Link from 'next/link';
import Image from 'next/image';

const Header = () => {
    return (
        <header className="...">
            <Link
                href="/"
                className="relative block w-[clamp(340px,18vw,1400px)] transition-transform hover:scale-105"
            >
                <Image
                    src="/refactored_logo.webp"
                    alt="Rajput Foods Logo"
                    width={720}
                    height={1280}
                    priority
                />
            </Link>
        </header>
    );
};

export default Header;
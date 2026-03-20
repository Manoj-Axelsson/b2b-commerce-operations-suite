import Image from "next/image";

interface HeaderProps { }

const Header = ({ }: HeaderProps) => {
    return (
        <header className="fixed top-0 left-0 w-full z-50 flex justify-center p-8 pointer-events-none">
            <div className="relative w-[220px] md:w-[320px] aspect-square opacity-95 mix-blend-multiply pointer-events-auto">
                <Image
                    src="/rajput-logo.svg"
                    alt="Rajput Foods Logo"
                    width={400}
                    height={400}
                    priority
                    className="w-[280px] md:w-[400px] h-auto object-contain" />
            </div>
        </header>
    );
};

export default Header;




import Image from "next/image";

type HeaderProps = {
    className?: string;
};

export const Header = ({ className = "" }: HeaderProps) => {
    return (
        <header className={`flex justify-center items-center ${className}`}>
            <Image
                src="/rajput_logo.svg"
                alt="Rajput Foods Logo"
                width={400}
                height={400}
                priority
                className="w-[400px] h-auto object-contain"
            />
        </header>
    );
};

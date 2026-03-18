import Image from 'next/image';

export const Header = () => {
    return (

        <div className="flex items-center">
            <Image
                src="/rajput_logo.svg"
                alt="Rajput Foods Logo"
                width={500}
                height={500}
                priority
                loading="eager"
                className="h-80 w-auto object-contain"
            />
        </div>

    );
};

import { Header } from '@/components/layout/Header';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col justify-start items-center bg-[#E0F7FA] overflow-hidden">

      <div className="fixed inset-0 z-0">
        <Image
          src="/heritage-backdrop.jpg"
          alt="Rajput Heritage Artwork"
          fill
          priority
          className="object-cover opacity-20"
        />
      </div>

      <div
        className="absolute top-24 md:top-32 w-full z-10 opacity-80 flex justify-center pointer-events-none">
        <Header />
      </div>

      <section className="relative z-50 flex flex-col items-center text-center px-4 mt-[560px] md:mt-[600px]">

        <h2 className="text-base md:text-lg font-medium text-[#1c0a5c] tracking-[0.2em] uppercase mb-3">
          Welcome To
        </h2>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-[#1c0a5c] drop-shadow-md">
          Rajput Foods Sweden
        </h1>

        <p className="mb-10 text-[#1c0a5c] font-serif italic font-bold text-base opacity-100">
          Quality you can trust. Service defined by integrity
        </p>

        <button className="
          px-6 py-2.5 
          bg-linear-to-tr from-[#1a1201] via-[#D4AF37] to-[#FFD700]
          text-white text-base font-bold uppercase tracking-[0.15em]
          rounded-full shadow-2xl
          hover:scale-105 hover:brightness-110
          hover:shadow-[0_0_25px_rgba(212,175,55,0.5)]
          transition-all duration-300 ease-in-out
          active:scale-95
        ">
          Enter
        </button>
      </section>
    </main>
  );
}
import Link from "next/link";

const ProductNotFound = () => {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
            <div className="mb-6 h-16 w-16 sm:h-20 sm:w-20 text-muted-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                </svg>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-brand-primary md:text-4xl">
                Product No Longer Available
            </h2>

            <p className="mt-4 max-w-md text-muted-foreground italic">
                The item you are looking for may have been moved or removed from our heritage collection.
            </p>

            <Link
                href="/products"
                className="mt-8 rounded-full bg-brand-primary px-6 py-3 sm:px-8 text-sm font-bold uppercase tracking-widest text-white transition-all hover:bg-brand-gold-dark hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-gold-dark"
            >
                Back to Catalog
            </Link>
        </div>
    );
};

export default ProductNotFound;

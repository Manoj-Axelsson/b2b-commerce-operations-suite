const LoadingProduct = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 md:py-16 sm:px-6 lg:px-8 animate-pulse">
            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">
                <div className="aspect-square w-full rounded-2xl sm:rounded-3xl bg-muted" />

                <div className="mt-8 sm:mt-12 lg:mt-0 flex flex-col gap-6">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-10 sm:h-12 w-3/4 bg-muted rounded" />

                    <div className="space-y-3 mt-4">
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-full bg-muted rounded" />
                        <div className="h-4 w-2/3 bg-muted rounded" />
                    </div>

                    <div className="mt-8 h-12 sm:h-14 w-full sm:w-64 bg-muted rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default LoadingProduct;

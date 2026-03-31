const LoadingProduct = () => {
    return (
        <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8 animate-pulse">
            <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-x-12">

                <div className="aspect-square w-full rounded-3xl bg-gray-200" />

                <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0 flex flex-col gap-6">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                    <div className="h-12 w-3/4 bg-gray-200 rounded" />

                    <div className="space-y-3 mt-4">
                        <div className="h-4 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-full bg-gray-200 rounded" />
                        <div className="h-4 w-2/3 bg-gray-200 rounded" />
                    </div>

                    <div className="mt-8 h-14 w-64 bg-gray-200 rounded-full" />
                </div>
            </div>
        </div>
    );
};

export default LoadingProduct;
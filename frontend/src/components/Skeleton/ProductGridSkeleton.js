const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="rounded-2xl border border-white/[0.08] bg-[#161616] p-3">
        <div className="skeleton-shimmer h-44 rounded-xl" />
        <div className="skeleton-shimmer mt-3 h-4 rounded-full" />
        <div className="skeleton-shimmer mt-2 h-4 w-2/3 rounded-full" />
        <div className="skeleton-shimmer mt-4 h-9 rounded-full" />
      </div>
    ))}
  </div>
);

export default ProductGridSkeleton;


export default function WishlistLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-8 max-w-[1440px] mx-auto space-y-8">
      <div className="h-9 w-48 mx-auto bg-[#EFE7E2] rounded-xl animate-pulse" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl bg-white border border-[#EADFD6] overflow-hidden">
            <div className="w-full h-64 bg-[#F3EFEA] animate-pulse" />
            <div className="p-3 space-y-2">
              <div className="h-4 w-3/4 bg-[#F3EFEA] rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-[#F3EFEA] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

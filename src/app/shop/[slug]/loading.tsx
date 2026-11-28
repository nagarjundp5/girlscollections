export default function ProductDetailLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-8 px-4 sm:px-8 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="w-full h-[65vh] bg-white border border-[#EADFD6] rounded-2xl animate-pulse" />
        <div className="space-y-4 py-4">
          <div className="h-8 w-3/4 bg-[#EFE7E2] rounded-xl animate-pulse" />
          <div className="h-6 w-32 bg-[#EFE7E2] rounded-xl animate-pulse" />
          <div className="h-12 w-full bg-[#EFE7E2] rounded-xl animate-pulse mt-6" />
          <div className="h-12 w-full bg-[#F5D0DC] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

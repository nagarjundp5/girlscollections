export default function CartLoading() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] py-10 px-4 sm:px-8 max-w-5xl mx-auto space-y-6">
      <div className="h-8 w-40 bg-[#EFE7E2] rounded-xl animate-pulse" />
      {[1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-[#EADFD6] p-4 flex gap-4">
          <div className="w-[72px] h-[96px] rounded-[12px] bg-[#F3EFEA] animate-pulse" />
          <div className="flex-1 space-y-2 py-1">
            <div className="h-4 w-2/3 bg-[#F3EFEA] rounded animate-pulse" />
            <div className="h-4 w-1/3 bg-[#F3EFEA] rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}

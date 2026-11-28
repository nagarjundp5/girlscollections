export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-[#FBF8F4] text-[#1A1E3A] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="h-9 w-48 bg-[#EFE7E2] rounded-xl animate-pulse" />
        <div className="bg-white rounded-2xl border border-[#EADFD6] p-6 space-y-4">
          <div className="h-5 w-40 bg-[#F3EFEA] rounded animate-pulse" />
          <div className="h-24 w-full bg-[#FBF8F4] rounded-xl animate-pulse" />
        </div>
        <div className="bg-white rounded-2xl border border-[#EADFD6] p-6 space-y-4">
          <div className="h-5 w-32 bg-[#F3EFEA] rounded animate-pulse" />
          <div className="h-24 w-full bg-[#FBF8F4] rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}

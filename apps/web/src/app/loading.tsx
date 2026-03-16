export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#FFFFFF]/20 border-t-[#FFFFFF]" />
        <p className="text-[#F8FAFC]/40 text-sm font-['Orbitron']">Loading...</p>
      </div>
    </div>
  );
}

import Roller from "@/components/Roller";

export default function Home() {
  return (
    <div className="relative h-screen w-full">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 max-sm:w-[90vw] -translate-y-56 space-y-4">
        <h2 className="text-center">Roller</h2>
        <Roller />
      </div>
    </div>
  );
}

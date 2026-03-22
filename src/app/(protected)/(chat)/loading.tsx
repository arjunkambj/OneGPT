import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="relative flex h-dvh flex-col">
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-md" />
        <Skeleton className="h-5 w-32" />
      </div>

      <div className="relative flex-1 overflow-y-auto">
        <div className="mx-auto max-w-2xl space-y-6 px-4 py-8">
          <Skeleton className="h-16 w-2/3 rounded-2xl" />
          <Skeleton className="ml-auto h-20 w-3/4 rounded-2xl" />
          <Skeleton className="h-24 w-1/2 rounded-2xl" />
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="mx-auto max-w-2xl">
          <Skeleton className="h-28 w-full rounded-3xl" />
        </div>
      </div>
    </div>
  );
}

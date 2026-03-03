// src/components/skeletons/SpaceCardSkeleton.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton"; // Certifique-se de ter este componente de Skeleton

export const SpaceCardSkeleton = () => {
  return (
    <Card className="overflow-hidden border-none shadow-md bg-white rounded-3xl animate-pulse">
      <div className="relative h-60 overflow-hidden bg-slate-100">
        <Skeleton className="w-full h-full bg-slate-200" />
      </div>
      <CardContent className="p-6">
        <Skeleton className="h-6 w-3/4 mb-2 bg-slate-200" />
        <div className="flex items-center gap-1.5 mt-1">
          <Skeleton className="h-4 w-4 rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-1/2 bg-slate-200" />
        </div>

        <div className="grid grid-cols-2 gap-3 py-4 border-t border-slate-100 mt-4">
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <Skeleton className="h-3 w-3/4 mx-auto mb-1 bg-slate-200" />
            <Skeleton className="h-4 w-2/3 mx-auto bg-slate-200" />
          </div>
          <div className="bg-slate-50 rounded-2xl p-3 text-center">
            <Skeleton className="h-3 w-3/4 mx-auto mb-1 bg-slate-200" />
            <Skeleton className="h-4 w-2/3 mx-auto bg-slate-200" />
          </div>
        </div>

        <Skeleton className="h-12 w-full rounded-2xl bg-slate-200" />
      </CardContent>
    </Card>
  );
};
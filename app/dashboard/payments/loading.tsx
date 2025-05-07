import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList } from "@/components/ui/tabs"

export default function PaymentsLoading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56 mt-2" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-[120px]" />
          <Skeleton className="h-10 w-[140px]" />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-4" />
              </div>
              <Skeleton className="h-8 w-32 mt-2" />
              <Skeleton className="h-4 w-40 mt-1" />
            </div>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-10 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-10 rounded-md" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Table view loading skeleton */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </TabsList>

        <div className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between px-6 py-4">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="px-0">
              {/* Payments grouped by status */}
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="mb-8">
                  <div className="px-6 mb-2">
                    <Skeleton className="h-5 w-32" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 px-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                      <Card key={j} className="overflow-hidden border">
                        <CardHeader className="p-4 pb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Skeleton className="h-10 w-10 rounded-full" />
                              <div>
                                <Skeleton className="h-5 w-32" />
                                <Skeleton className="h-4 w-24 mt-1" />
                              </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-16" />
                              <Skeleton className="h-5 w-20" />
                            </div>
                            <div className="flex items-center justify-between">
                              <Skeleton className="h-4 w-20" />
                              <Skeleton className="h-4 w-28" />
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                              <Skeleton className="h-full w-3/5" />
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="p-3 border-t bg-muted/20">
                          <Skeleton className="h-8 w-full" />
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  )
}

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslation } from "@/hooks/useTranslation"
import { Construction } from "lucide-react"
import { useRouter } from "next/navigation"

export function UnderConstruction() {
  const { t } = useTranslation()
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Construction className="h-12 w-12 text-amber-500" />
          </div>
          <CardTitle className="text-2xl">{t("comingSoon")}</CardTitle>
          <CardDescription>{t("underConstruction")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p>{t("checkBackLater")}</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.back()}>{t("goBack")}</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

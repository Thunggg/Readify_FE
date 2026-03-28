"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackToBooksButton() {
  const router = useRouter()

  const handleBack = () => {
    router.replace("/admin/books")
  }

  return (
    <Button variant="outline" onClick={handleBack}>
      <ArrowLeft className="mr-2 size-4" />
      Quay lại
    </Button>
  )
}

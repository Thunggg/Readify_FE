"use client"

import { ReactNode, useState } from "react"
import { useRouter } from "next/navigation"
import { BookApiRequest } from "@/api-request/book"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from "sonner"

type DeleteBookButtonProps = {
  bookId: string
  trigger?: ReactNode
}

export function DeleteBookButton({ bookId, trigger }: DeleteBookButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      await BookApiRequest.adminDelete("", bookId)
      toast.success("Book deleted successfully")
      setOpen(false)
      router.push("/admin/books")
      router.refresh()
    } catch (error: any) {
      const details =
        error?.payload?.data?.details ||
        error?.payload?.details ||
        error?.data?.details ||
        []

      if (Array.isArray(details) && details.length > 0) {
        toast.error(details[0]?.message || "Cannot delete book")
      } else {
        toast.error(error?.payload?.message || error?.message || "Cannot delete book")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger ?? <Button variant="destructive">Delete</Button>}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Book</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this book?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive" disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


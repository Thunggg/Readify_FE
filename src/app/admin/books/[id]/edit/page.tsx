import { SidebarInset } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { EditBookForm } from "./edit-book-form"
import { notFound } from "next/navigation"
import { BookApiRequest } from "@/api-request/book"
import { cookies } from "next/headers"
import type { AdminBook } from "@/types/book"

const isAdminBook = (data: unknown): data is AdminBook => {
  return (
    typeof data === "object" &&
    data !== null &&
    "_id" in data &&
    typeof (data as { _id?: unknown })._id === "string" &&
    "title" in data &&
    typeof (data as { title?: unknown }).title === "string"
  )
}

export default async function EditBookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const cookieStore = await cookies()
  const accessToken = cookieStore.get("accessToken")?.value ?? ""

  let book: AdminBook | null = null

  try {
    const res = await BookApiRequest.adminGetById(accessToken, id)
    if (!res || !res.payload.success) {
      notFound()
    }
    if (!isAdminBook(res.payload.data)) {
      notFound()
    }
    book = res.payload.data
  } catch {
    notFound()
  }

  if (!book) {
    notFound()
  }

  return (
    <SidebarInset>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/books">Quản lý sách</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/admin/books/${book._id}`}>
                {book.title}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Chỉnh sửa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sách</h1>
          <p className="text-muted-foreground">Cập nhật thông tin sách</p>
        </div>

        <EditBookForm book={book} />
      </div>
    </SidebarInset>
  )
}

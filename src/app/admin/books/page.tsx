import { SidebarInset } from "@/components/ui/sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { BooksTable } from "./books-table"

export default function BooksPage() {
  return (
    <SidebarInset>
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center border-b px-6 bg-background">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Book Management</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Book Management</h1>
              <p className="text-muted-foreground">Manage all books in inventory</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" asChild>
                <Link href="/admin/books/trash">
                  <Trash2 className="mr-2 size-4" />
                  Trash
                </Link>
              </Button>
              <Button asChild>
                <Link href="/admin/books/new">
                  <Plus className="mr-2 size-4" />
                  Add New Book
                </Link>
              </Button>
            </div>
          </div>

          <BooksTable />
        </div>
      </div>
    </SidebarInset>
  )
}

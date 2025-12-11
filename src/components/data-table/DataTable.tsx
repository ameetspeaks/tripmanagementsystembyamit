import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  addUrl?: string;
  viewUrl?: (id: string) => string;
  editUrl?: (id: string) => string;
  onDelete?: (item: T) => void;
  searchKey?: keyof T;
  idKey?: keyof T;
}

export function DataTable<T extends { id: string | number }>({
  title,
  data,
  columns,
  addUrl,
  viewUrl,
  editUrl,
  onDelete,
  searchKey,
  idKey = "id" as keyof T,
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const filteredData = searchKey
    ? data.filter((item) =>
        String(item[searchKey]).toLowerCase().includes(search.toLowerCase())
      )
    : data;

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {addUrl && (
          <Button onClick={() => navigate(addUrl)}>
            <Plus className="w-4 h-4 mr-2" />
            Add New
          </Button>
        )}
      </div>

      {/* Search */}
      {searchKey && (
        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="data-table-header">
              {columns.map((col) => (
                <TableHead key={String(col.key)}>{col.header}</TableHead>
              ))}
              {(viewUrl || editUrl || onDelete) && (
                <TableHead className="w-32 text-right">Actions</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (viewUrl || editUrl || onDelete ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((item) => (
                <TableRow key={String(item[idKey])}>
                  {columns.map((col) => (
                    <TableCell key={String(col.key)}>
                      {col.render
                        ? col.render(item)
                        : String(item[col.key as keyof T] ?? "")}
                    </TableCell>
                  ))}
                  {(viewUrl || editUrl || onDelete) && (
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {viewUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(viewUrl(String(item[idKey])))}
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        {editUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(editUrl(String(item[idKey])))}
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onDelete(item)}
                            className="text-destructive hover:text-destructive"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  breadcrumbs?: BreadcrumbItem[]
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

export function PageHeader({ title, breadcrumbs, action, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="mb-4 text-sm">
          <ol className="flex items-center gap-2 text-gray-600">
            {breadcrumbs.map((crumb, index) => (
              <li key={index} className="flex items-center gap-2">
                {index > 0 && <span>/</span>}
                {crumb.href ? (
                  <Link to={crumb.href} className="hover:text-gray-900">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-900">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}

      {/* Title and Action */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {action && (
          <>
            {action.href ? (
              <Link to={action.href}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  {action.label}
                </Button>
              </Link>
            ) : (
              <Button onClick={action.onClick}>
                <Plus className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}


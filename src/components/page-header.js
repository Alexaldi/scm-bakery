"use client";

import { usePathname } from "next/navigation";
import { getPageMeta } from "@/lib/utils/navigation";

export default function PageHeader({ title, description, actions, breadcrumb }) {
  const pathname = usePathname();
  const meta = getPageMeta(pathname);
  const crumbs = breadcrumb || meta.breadcrumb;

  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <nav className="mb-2 flex flex-wrap gap-1 text-xs text-gray-500" aria-label="Breadcrumb">
          {crumbs.map((item, index) => (
            <span key={`${item}-${index}`} className="flex items-center gap-1">
              {index > 0 ? <span>/</span> : null}
              <span className={index === crumbs.length - 1 ? "font-medium text-gray-700" : ""}>{item}</span>
            </span>
          ))}
        </nav>
        <h1 className="text-2xl font-semibold tracking-normal text-gray-900">{title || meta.title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

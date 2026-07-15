<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SCM Bakery Production Rules

- Use Next.js App Router with JavaScript only. Do not create `.ts` or `.tsx` files.
- Keep Tailwind CSS and the existing ESLint flat config.
- Production data must come from PostgreSQL through Prisma. Do not add new mock data as an application data source.
- Prefer Server Components for database reads and Server Actions for database mutations. Keep database access server-only.
- `src/context/scm-context.js` is legacy prototype state and should be retired module-by-module as pages move to database-backed slices.
- `src/lib/mock-data` and `prisma/seed.js` are allowed only as development seed/reference data, not as runtime source of truth.
- Do not add API routes unless there is a clear integration requirement. Do not add a second backend inside this Next.js app.
- Allowed UI/runtime packages remain `lucide-react` and `recharts`; add other packages only when there is no reasonable native or existing-project option.
- Keep database helpers in `src/lib/db`, calculation logic in `src/lib/services`, formatting helpers in `src/lib/utils`, and reusable UI in `src/components`.
- Keep UI text in Indonesian and use Indonesian number/date formatting.
- Business calculations for linear regression, material requirements, weighted product supplier selection, procurement, and stock changes must stay outside JSX pages.
- Primary actions must visibly work through forms, modals, database mutations, state changes, notifications, or calculated results.
- Authentication uses database users, PBKDF2 password hashes, and JWT httpOnly cookies.
- Role access must be enforced server-side in route guards and Server Actions. Do not reintroduce client-side role simulation as security.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes -- APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# SCM Bakery Prototype Rules

- Use Next.js App Router with JavaScript only. Do not create `.ts` or `.tsx` files.
- Keep Tailwind CSS and the existing ESLint flat config.
- Shared prototype data lives in React Context at `src/context/scm-context.js` and persists through `localStorage`.
- Do not add a real backend: no database, Prisma, API routes, server actions, or authentication system.
- Allowed runtime packages for this prototype are `lucide-react` and `recharts`.
- Keep mock data in `src/lib/mock-data`, calculation logic in `src/lib/services`, formatting helpers in `src/lib/utils`, and reusable UI in `src/components`.
- Keep UI text in Indonesian and use Indonesian number/date formatting.
- Business calculations for linear regression, material requirements, weighted product supplier selection, procurement, and stock changes must stay outside JSX pages.
- Primary actions in the prototype must visibly work through forms, modals, state changes, notifications, or calculated results.
- Administrator can access all menus. Other simulated roles may have filtered navigation, but this is only for demonstration and not real security.

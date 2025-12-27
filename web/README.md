# MyContest Web Application

Modern Next.js application with shadcn/ui and centralized API architecture.

## Features

- ✅ **Next.js 14** with App Router
- ✅ **TypeScript** for type safety
- ✅ **Tailwind CSS** for styling
- ✅ **shadcn/ui** components
- ✅ **Centralized API client**
- ✅ **Optimized sidebar** with essential navigation
- ✅ **Responsive design**

## Project Structure

```
web/
├── app/
│   ├── (dashboard)/         # Dashboard layout group
│   │   ├── layout.tsx       # Sidebar layout
│   │   ├── problems/        # Problems pages
│   │   ├── contests/        # Contests pages
│   │   ├── discuss/         # Discussion pages
│   │   ├── notifications/   # Notifications pages
│   │   └── settings/        # Settings pages
│   ├── globals.css          # Global styles
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home (redirects to /problems)
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   └── badge.tsx
│   └── sidebar.tsx          # Optimized sidebar
├── lib/
│   ├── api.ts               # Centralized API client
│   └── utils.ts             # Utilities (cn helper)
├── hooks/                   # Custom React hooks
├── stores/                  # State management (Zustand)
├── types/                   # TypeScript types
└── package.json
```

## Centralized API Client

All API calls go through `/lib/api.ts`:

```typescript
import { problemsApi, contestsApi, discussionsApi, notificationsApi } from '@/lib/api'

// Problems
const problems = await problemsApi.getAll({ page: 1, difficulty: 'easy' })
const problem = await problemsApi.getById(123)

// Contests
const contests = await contestsApi.getAll({ status: 'ongoing' })
const contest = await contestsApi.getById(456)
await contestsApi.join(456)

// Discussions
const discussions = await discussionsApi.getAll()
await discussionsApi.create({ content: 'Hello!' })

// Notifications
const notifications = await notificationsApi.getAll({ unread_only: true })
await notificationsApi.markAsRead(789)
```

## API Response Format

All API responses follow this format:

```typescript
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  timestamp: string
}

interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}
```

## Optimized Sidebar

The sidebar includes only essential navigation items:

1. **Problems** - Browse and solve coding problems
2. **Contests** - Participate in coding contests
3. **Discuss** - General chat and problem discussions
4. **Notifications** - Stay updated with activity
5. **Settings** - Profile, security, appearance, notifications

## Components

### shadcn/ui Components

Pre-built, accessible components:
- Button
- Badge
- Dialog
- Dropdown Menu
- Avatar
- Toast
- Tabs
- Select

### Custom Components

- **Sidebar** - Collapsible navigation with badge support

## Styling

### Tailwind CSS

Utility-first CSS framework with custom theme:

```typescript
// Light mode
--background: 0 0% 100%
--foreground: 222.2 84% 4.9%
--primary: 221.2 83.2% 53.3%

// Dark mode
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 217.2 91.2% 59.8%
```

### Custom Utilities

```typescript
import { cn } from '@/lib/utils'

// Merge Tailwind classes
<div className={cn('p-4', isActive && 'bg-primary')} />
```

## Pages

### Problems Page
- List all problems with filters (difficulty, search)
- Pagination
- Problem status (solved, attempted, not attempted)
- Click to view problem details

### Contests Page
- List contests with filters (upcoming, ongoing, finished)
- Contest cards with metadata
- Join contest button
- View leaderboard

### Discuss Page
- General discussion threads
- Problem-specific discussions
- Create new discussions
- Reply to discussions
- Real-time timestamps

### Notifications Page
- List all notifications
- Filter by unread
- Mark as read
- Mark all as read
- Delete notifications
- Notification types (submission, discussion, contest)

### Settings Page
- **Profile**: Name, email, bio
- **Security**: Change password
- **Appearance**: Theme selection
- **Notifications**: Preferences

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Lint code
npm run lint
```

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

## Adding a New Page

1. Create page file in `app/(dashboard)/your-page/page.tsx`
2. Add route to sidebar in `components/sidebar.tsx`
3. Create API functions in `lib/api.ts` if needed

Example:

```typescript
// app/(dashboard)/my-page/page.tsx
'use client'

export default function MyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Page</h1>
      {/* Content */}
    </div>
  )
}
```

## Adding a New Component

1. If using shadcn/ui, run: `npx shadcn-ui@latest add <component>`
2. For custom components, create in `components/`

## Best Practices

1. **Use TypeScript** for type safety
2. **Use API client** for all API calls
3. **Use shadcn/ui components** for consistency
4. **Follow Next.js conventions** (App Router)
5. **Keep components small** and focused
6. **Use client components** (`'use client'`) only when needed
7. **Handle loading and error states**
8. **Follow Tailwind conventions**

## Keyboard Shortcuts

(To be implemented)
- `Ctrl+K` - Quick search
- `Ctrl+/` - Toggle sidebar
- `Ctrl+B` - Toggle theme

## Responsive Design

All pages are fully responsive:
- **Mobile**: Collapsible sidebar, stacked layout
- **Tablet**: Partial sidebar, adaptive layout
- **Desktop**: Full sidebar, multi-column layout

## Performance

- Server components by default (faster)
- Client components only when needed (interactivity)
- Automatic code splitting
- Image optimization
- Route prefetching

## Accessibility

- Keyboard navigation
- Screen reader support
- ARIA labels
- Focus management
- High contrast mode support

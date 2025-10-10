# EV Service Center - Frontend

Dự án website quản lý trung tâm bảo dưỡng xe điện được xây dựng với Next.js 15 và Shadcn UI.

## 🎨 UI Framework

Dự án sử dụng **Shadcn UI** - một thư viện UI components hiện đại được xây dựng trên:

- **Radix UI** - Headless components
- **Tailwind CSS** - Utility-first CSS framework
- **Class Variance Authority** - Type-safe variant API
- **Lucide React** - Beautiful icons

## 🚀 Technologies

- **Next.js 15** - React framework với Turbopack
- **TypeScript** - Type safety
- **Shadcn UI** - Modern UI components
- **Tailwind CSS v4** - Styling
- **Zustand** - State management
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **React Query** - Server state management

## 📦 UI Components Available

### Basic Components

- ✅ `Button` - Various variants (default, outline, ghost, etc.)
- ✅ `Input` - Form inputs with validation
- ✅ `Label` - Form labels
- ✅ `Card` - Content containers
- ✅ `Badge` - Status indicators
- ✅ `Avatar` - User profile images
- ✅ `Separator` - Visual dividers

### Form Components

- ✅ `Input` with error states
- ✅ `Label` with accessibility
- ✅ Form validation với React Hook Form + Zod

### Layout Components

- ✅ `Card` với Header, Content, Footer
- ✅ Container layouts
- ✅ Responsive grid systems

## 🎨 Design System

### Colors

- **Primary**: Green (#22c55e) - EV theme
- **Secondary**: Neutral grays
- **Destructive**: Red for errors
- **Muted**: Subtle backgrounds

### Typography

- **Font**: Inter - Clean, modern typeface
- **Sizes**: Responsive scale từ xs → 6xl
- **Weights**: 400, 500, 600, 700

### Spacing & Layout

- **Container**: max-width với responsive padding
- **Grid**: 12-column responsive grid
- **Border radius**: Rounded corners (0.5rem default)

## 🛠️ Installation & Setup

```bash
# Clone repository
git clone <repository-url>

# Install dependencies
npm install

# Run development server
npm run dev
```

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Shadcn UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── home/              # Homepage components
│   └── auth/              # Authentication components
├── lib/
│   ├── utils.ts           # Utility functions (cn, etc.)
│   └── providers.tsx      # App providers
├── app/                   # Next.js App Router
└── styles/               # Global styles
```

## 🎯 Usage Examples

### Button Component

```tsx
import { Button } from "@/components/ui/button";

// Basic button
<Button>Click me</Button>

// Variants
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Delete</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>

// With Link
<Button asChild>
  <Link href="/dashboard">Go to Dashboard</Link>
</Button>
```

### Card Component

```tsx
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>;
```

### Form Components

```tsx
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="your@email.com"
    {...register("email")}
  />
  {errors.email && (
    <p className="text-sm text-destructive">{errors.email.message}</p>
  )}
</div>;
```

## 🎨 Theming & Customization

### CSS Variables

Các màu sắc được định nghĩa trong `src/app/globals.css`:

```css
:root {
  --primary: 142.1 76.2% 36.3%; /* Green */
  --secondary: 210 40% 94%; /* Light gray */
  --destructive: 0 84.2% 60.2%; /* Red */
  --background: 0 0% 100%; /* White */
  --foreground: 222.2 84% 4.9%; /* Dark text */
  /* ... */
}
```

### Dark Mode

```css
.dark {
  --background: 222.2 84% 4.9%; /* Dark background */
  --foreground: 210 40% 98%; /* Light text */
  /* ... */
}
```

## 🔧 Adding New Components

1. Tạo component trong `src/components/ui/`
2. Sử dụng `cn()` utility để merge classes
3. Follow Radix UI patterns cho accessibility
4. Export từ component file

```tsx
// Example: Alert component
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const alertVariants = cva("relative w-full rounded-lg border p-4", {
  variants: {
    variant: {
      default: "bg-background text-foreground",
      destructive: "border-destructive/50 text-destructive",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export interface AlertProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof alertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
);
Alert.displayName = "Alert";

export { Alert, alertVariants };
```

## 📚 Resources

- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Tailwind CSS](https://tailwindcss.com/)
- [Next.js Documentation](https://nextjs.org/docs)

## 🤝 Contributing

1. Tuân theo design system đã định sẵn
2. Sử dụng TypeScript và type safety
3. Test components trên multiple screen sizes
4. Follow accessibility best practices
5. Keep components small và focused

## 📄 License

MIT License - see LICENSE file for details

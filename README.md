# Daily Workout

The app combines the public self-paced Built to Move program with daily
PushJerk and Linchpin workout feeds.

## Built to Move

The nine workout definitions live in `data/built-to-move-program.mjs`. Each
definition has four weekly prescriptions. A program run has 36 separately
recordable sessions. Validate or synchronize the program with:

```bash
pnpm program:audit
pnpm program:seed --dry-run
pnpm program:seed
```

See [GitHub issue #1](https://github.com/bergholmm/daily-workout/issues/1) for
the product specification and training rules.

## Development

```bash
pnpm dev
```

## Components

This is a Next.js template with shadcn/ui.

### Adding components

To add components to your app, run the following command:

```bash
npx shadcn@latest add button
```

This will place the ui components in the `components` directory.

### Using components

To use the components in your app, import them as follows:

```tsx
import { Button } from "@/components/ui/button"
```

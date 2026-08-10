# Daily Workout

The app combines a public self-paced CAPABLE training program with daily
PushJerk and Linchpin workout feeds.

## CAPABLE

The canonical 12-week, 36-session program lives in
`data/capable-program.mjs`. Validate or synchronize it with:

```bash
pnpm program:seed --dry-run
pnpm program:seed
```

See `docs/capable-program.md` for the structure and programming rules.

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

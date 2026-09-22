# Daily Workout

The app combines reusable training programs with daily PushJerk and Linchpin
workout feeds.

## Hybrid PPL

Hybrid PPL is an ongoing five-workout sequence: Push, Easy Run, Legs, Pull,
and Longer Easy Run. Each performance creates a dated session in the same
unrestricted workout history used by MILE. Validate or synchronize it with:

```bash
pnpm hybrid-ppl:audit
pnpm hybrid-ppl:seed --dry-run
pnpm hybrid-ppl:seed
```

The seed is idempotent. It preserves the existing owner and session history,
and requires `HYBRID_PPL_OWNER_ID` only when the program and its MILE owner
fallback do not exist.

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

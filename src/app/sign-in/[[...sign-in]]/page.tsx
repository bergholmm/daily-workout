import { SignIn } from "@clerk/nextjs"

import { ClearCachedData } from "@/components/swr-cache-provider"

export default function SignInPage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center">
      <ClearCachedData />
      <SignIn forceRedirectUrl="/" />
    </div>
  )
}

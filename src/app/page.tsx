import { deletePost, getPosts } from '~/server/queries'

import { Button } from '~/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '~/components/ui/card'

import { safeAsync } from '~/lib/safeAsync'

export const dynamic = 'force-dynamic'

type Post = Awaited<ReturnType<typeof getPosts>>[0]

function PostCard({ post }: { post: Post }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.name}</CardTitle>
        <CardDescription>{post.id}</CardDescription>
      </CardHeader>
      <CardContent>
        <p>{post.createdAt.toISOString()}</p>
      </CardContent>
      <CardFooter>
        <form
          action={async () => {
            'use server'
            await deletePost(post.id)
          }}
        >
          <Button type="submit" variant="destructive">
            Delete
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}

export default async function HomePage() {
  const [posts, err] = await safeAsync(getPosts)

  return (
    <main className="container flex flex-col items-center justify-center">
      <div className="flex flex-wrap justify-center gap-4">
        {posts?.map((p) => {
          return <PostCard key={p.id} post={p} />
        })}
        {err && <div>Failed to load posts</div>}
      </div>
    </main>
  )
}

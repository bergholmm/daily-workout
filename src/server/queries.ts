import 'server-only'

import { auth } from '@clerk/nextjs/server'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

import { serverSideAnalyticsClient } from './analytics'
import { db } from './db'
import { posts } from './db/schema'
import { ratelimit } from './ratelimit'

export const getPosts = async () => {
  const user = auth()

  if (!user.userId) throw new Error('User not authenticated')

  const posts = await db.query.posts.findMany()

  return posts
}

export const createPost = async (data: { content: string }) => {
  const user = auth()
  if (!user.userId) throw new Error('User not authenticated')

  const { success } = await ratelimit.limit(user.userId)
  if (!success) throw new Error('Rate limit exceeded')

  const rows = await db
    .insert(posts)
    .values({
      name: data.content,
    })
    .returning()

  serverSideAnalyticsClient.capture({
    distinctId: user.userId,
    event: 'post created',
    properties: {
      postId: rows?.[0]?.id,
      content: data.content,
    },
  })

  revalidatePath('/')
  return rows?.[0]
}

export const deletePost = async (id: number) => {
  const user = auth()
  if (!user.userId) throw new Error('User not authenticated')

  await db.delete(posts).where(eq(posts.id, id))

  serverSideAnalyticsClient.capture({
    distinctId: user.userId,
    event: 'post deleted',
    properties: {
      postId: id,
    },
  })

  revalidatePath('/')
}

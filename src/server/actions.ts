'use server'

import { createPost } from '~/server/queries'

import { safeAsync } from '~/lib/safeAsync'

export const createPostAction = async () => {
  const [, err] = await safeAsync(createPost, { content: 'name' })
  if (err) {
    return {
      type: 'error',
      error: err.message,
    }
  }

  return {
    type: 'success',
  }
}

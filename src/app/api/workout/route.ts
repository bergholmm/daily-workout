import { type NextRequest } from "next/server"
import { safeAsync } from "~/lib/safeAsync"
import { getWorkout, createWorkout } from "~/server/actions"
import { parse } from 'node-html-parser';

const getUrl = (date: string) => `https://crossfitlinchpin.com/blogs/wod/${date}-workout-of-the-day`
const fetchWorkout = async (date: string) => {
  const [year, month, day] = date.split('-')
  const workoutDate = `${month}-${day}-${year}`;
  const url = getUrl(workoutDate)
  const [res, err] = await safeAsync(fetch(url))

  if (err) {
    console.error(err)
    return null
  }

  if (!res) {
    console.warn('No res');
    return null
  }

  const text = await res.text()
  const root = parse(text);
  const article = root.querySelector('article');

  if (!article) {
    console.warn('Article not found');
    return null;
  }

  const workout = article.textContent.split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .filter((l) => !l.includes("Want a 30-day free trial of the Linchpin Private Track?")).join('\n')

  return workout
}


// GET /api/getWorkout
// Expected query params: date (optional) (format: YYYY-MM-DD)
export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams
  const date = searchParams.get('date') ?? new Date().toISOString().split('T')[0]!

  console.log(`Getting workout for date: ${date}`)
  const [w, err] = await safeAsync(getWorkout(date))

  if (err) {
    console.error(err)
    return new Response(`Error: ${err.message}`, { status: 500 })
  }

  if (w) {
    return Response.json(w)
  }

  console.log(`Not found in db, fetching from website`)
  const workout = await fetchWorkout(date)

  if (!workout) {
    return new Response('Workout not found', { status: 404 })
  }

  console.log(`Creating new workout in db`)
  const [, err2] = await safeAsync(createWorkout(workout, date))

  if (err2) {
    console.error(err2)
    return new Response(`Error: ${err2.message}`, { status: 500 })
  }

  return Response.json(workout)
}

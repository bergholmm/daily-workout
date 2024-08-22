import 'server-only'

import { parse } from 'node-html-parser'

import { SEPARATOR } from '~/lib/constants'
import { safeAsync } from '~/lib/safeAsync'
import { type WorkoutName } from '~/lib/types'

import * as dbWorkouts from './db/workouts'

const getLinchpinUrl = (date: string) =>
  `https://crossfitlinchpin.com/blogs/wod/${date}-workout-of-the-day`

const fetchLinchpinWorkout = async (date: string) => {
  const [year, month, day] = date.split('-')
  const workoutDate = `${month}-${day}-${year}`
  const url = getLinchpinUrl(workoutDate)
  const [res, err] = await safeAsync(fetch(url))

  if (err) {
    console.error(err)
    return null
  }

  if (!res) {
    console.warn('No res')
    return null
  }

  const text = await res.text()
  const root = parse(text)
  const article = root.querySelector('article')

  if (!article) {
    console.warn('Article not found', url)
    return null
  }

  const workout = Array.from(article.querySelectorAll('span'))
    .flatMap((s) => {
      const textContent = s.textContent
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      if (!textContent.length) {
        return [SEPARATOR]
      } else {
        return textContent
      }
    })
    .flat()
    .filter(
      (l) =>
        !l.includes('Want a 30-day free trial of the Linchpin Private Track?'),
    )

  if (!workout.length) return null
  if (workout.join('').includes('REST DAY!')) return null

  return workout
}

const getInvictusUrl = (date: string) =>
  `https://www.crossfitinvictus.com/wod/${date}-performance/`
const getInvictusUrl2 = (date: string) =>
  `https://www.crossfitinvictus.com/wod/${date}-performance-fitness/`
const monthMap: Record<string, string> = {
  '01': 'january',
  '02': 'february',
  '03': 'march',
  '04': 'april',
  '05': 'may',
  '06': 'june',
  '07': 'july',
  '08': 'august',
  '09': 'september',
  '10': 'october',
  '11': 'november',
  '12': 'december',
}

const fetchInvictusWorkout = async (date: string) => {
  const [year, month, day] = date.split('-')
  const workoutDate = `${monthMap[month!]}-${day}-${year}`
  const url = getInvictusUrl(workoutDate)
  const [res, err] = await safeAsync(fetch(url))
  if (err) {
    console.error(err)
    return null
  }

  if (!res) {
    console.warn('No res')
    return null
  }

  const text = await res.text()
  const root = parse(text)
  let content = root.querySelector('div[class*="entry-content"]')

  if (!content) {
    console.warn('first url not found', url)
    const url2 = getInvictusUrl2(workoutDate)
    const [res, err] = await safeAsync(fetch(url2))
    if (err) {
      console.error(err)
      return null
    }

    if (!res) {
      console.warn('No res')
      return null
    }
    const text = await res.text()
    const root = parse(text)
    content = root.querySelector('div[class*="entry-content"]')
    if (!content) {
      console.warn('Content not found', url2)
      return null
    }
  }

  const workout = Array.from(content.querySelectorAll('p'))
    .flatMap((p, index, arr) => {
      const textContent = p.textContent
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      // If it's not the last paragraph, add the separator at the end
      if (index < arr.length - 1) {
        return [...textContent, SEPARATOR]
      } else {
        return textContent
      }
    })
    .flat()

  if (!workout.length) return null
  return workout
}

const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const months = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
]
const formatPushJerkDate = (date: Date): string => {
  const year = date.getFullYear()
  const month = months[date.getMonth()] // Get month name
  const day = String(date.getDate()).padStart(2, '0') // Ensure day is two digits
  const dayOfWeek = daysOfWeek[date.getDay()] // Get day of the week

  return `${dayOfWeek}-${month}-${day}-${year}`
}
const getPushJerkUrl = (date: string) => `https://pushjerk.com/${date}/`

const fetchPushjerkWorkout = async (date: string) => {
  const d = new Date(date)
  const formattedDate = formatPushJerkDate(d)
  const url = getPushJerkUrl(formattedDate)
  const [res, err] = await safeAsync(fetch(url))
  if (err) {
    console.error(err)
    return null
  }

  if (!res) {
    console.warn('No res')
    return null
  }

  const text = await res.text()
  const root = parse(text)
  const content = root.querySelector('div[class*="entry-content"]')

  if (!content) {
    console.warn('Content not found', url)
    return null
  }

  const workout = Array.from(content.querySelectorAll('p'))
    .flatMap((p, index, arr) => {
      const textContent = p.textContent
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean)

      // If it's not the last paragraph, add the separator at the end
      if (index < arr.length - 1) {
        return [...textContent, SEPARATOR]
      } else {
        return textContent
      }
    })
    .flat()
  if (!workout.length) return null
  if (
    workout
      .join('')
      .includes('It looks like nothing was found at this location')
  )
    return null
  return workout
}

// d (format: YYYY-MM-DD)
export const getWorkout = async (workoutName: WorkoutName, d?: string) => {
  const date = d ?? new Date().toISOString().split('T')[0]!

  console.log(`Getting workout for date: ${date}`)
  const [w, err] = await safeAsync(dbWorkouts.getWorkout(date, workoutName))

  console.log(w, err)

  if (err) {
    console.error(err)
    throw new Error(err.message)
  }

  if (w) {
    return w
  }

  console.log(`Not found in db, fetching from website`)
  let workout: string[] | null = null
  switch (workoutName) {
    case 'linchpin':
      workout = await fetchLinchpinWorkout(date)
      break
    case 'invictus':
      workout = await fetchInvictusWorkout(date)
      break
    case 'pushjerk':
      workout = await fetchPushjerkWorkout(date)
      break
    default:
      break
  }

  if (!workout) {
    throw new Error('Workout not found')
  }

  console.log(`Creating new workout in db`)
  const [w2, err2] = await safeAsync(
    dbWorkouts.createWorkout(workout, date, workoutName),
  )

  if (err2) {
    console.error(err2)
    throw new Error(err2.message)
  }

  return w2
}

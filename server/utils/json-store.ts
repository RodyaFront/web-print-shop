import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

const writeQueues = new Map<string, Promise<unknown>>()

async function withFileLock<T>(path: string, task: () => Promise<T>): Promise<T> {
  const previous = writeQueues.get(path) ?? Promise.resolve()
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  const next = previous.then(() => gate)
  writeQueues.set(path, next)
  await previous.catch(() => undefined)
  try {
    return await task()
  } finally {
    release()
    if (writeQueues.get(path) === next) {
      writeQueues.delete(path)
    }
  }
}

export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const raw = await readFile(path, 'utf8')
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export async function writeJsonFile(path: string, value: unknown) {
  await withFileLock(path, async () => {
    await mkdir(dirname(path), { recursive: true })
    const tmp = `${path}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tmp, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
    await rename(tmp, path)
  })
}

export async function updateJsonFile<T>(
  path: string,
  updater: (current: T | null) => T | Promise<T>,
): Promise<T> {
  return withFileLock(path, async () => {
    const current = await readJsonFile<T>(path)
    const next = await updater(current)
    await mkdir(dirname(path), { recursive: true })
    const tmp = `${path}.${process.pid}.${Date.now()}.tmp`
    await writeFile(tmp, `${JSON.stringify(next, null, 2)}\n`, 'utf8')
    await rename(tmp, path)
    return next
  })
}

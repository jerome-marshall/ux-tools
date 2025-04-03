import { db } from '@/server/db'

export async function createTransaction<T extends typeof db, R>(
  cb: (trx: T) => Promise<R>
): Promise<R> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
  return await db.transaction(cb as any)
}

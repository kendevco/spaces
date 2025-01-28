import type { CollectionConfig } from 'payload'
import { revalidateTag, revalidatePath } from 'next/cache'
import type { Page } from '../../../payload-types'

export const revalidatePage: NonNullable<
  NonNullable<CollectionConfig['hooks']>['afterChange']
>[number] = ({ doc, previousDoc, req: { payload, context } }) => {
  const typedDoc = doc as Page
  if (!context.disableRevalidate) {
    if (typedDoc._status === 'published') {
      const path = typedDoc.slug === 'home' ? '/' : `/${typedDoc.slug}`
      payload.logger.info(`Revalidating page at path: ${path}`)
      revalidatePath(path)
      revalidateTag('pages-sitemap')
    }
    if (previousDoc?._status === 'published' && typedDoc._status !== 'published') {
      const oldPath = previousDoc.slug === 'home' ? '/' : `/${previousDoc.slug}`
      payload.logger.info(`Revalidating old page at path: ${oldPath}`)
      revalidatePath(oldPath)
      revalidateTag('pages-sitemap')
    }
  }
  return typedDoc
}

type HookType = NonNullable<NonNullable<CollectionConfig['hooks']>['beforeDelete']>[number]
export const revalidateDelete: HookType = async ({ id, req }) => {
  const doc = (await req.payload.findByID({ collection: 'pages', id })) as Page
  if (doc?.slug) {
    const path = doc.slug === 'home' ? '/' : `/${doc.slug}`
    revalidatePath(path)
    revalidateTag('pages-sitemap')
  }
  return
}

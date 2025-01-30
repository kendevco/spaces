import { mongooseAdapter } from '@payloadcms/db-mongodb'
import sharp from 'sharp'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'

import { Categories } from './collections/Categories'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Posts } from './collections/Posts'
import { Users } from './collections/Users'
import { Footer } from './Footer/config'
import { Header } from './Header/config'
import { plugins } from './plugins'
import { defaultLexical } from '@/fields/defaultLexical'
import { getServerSideURL } from './utilities/getURL'

import {
  Profiles,
  Spaces,
  Members,
  Channels,
  Messages,
  Conversations,
  DirectMessages,
  SpacesMedia,
} from './spaces/collections'
import { Settings } from './spaces/globals/Settings/config'
import { CollectionSlugs, ChannelType, MemberRole } from './spaces/types'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  serverURL: getServerSideURL(),
  admin: {
    components: {
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    user: Users.slug,
    livePreview: {
      breakpoints: [
        {
          label: 'Mobile',
          name: 'mobile',
          width: 375,
          height: 667,
        },
        {
          label: 'Tablet',
          name: 'tablet',
          width: 768,
          height: 1024,
        },
        {
          label: 'Desktop',
          name: 'desktop',
          width: 1440,
          height: 900,
        },
      ],
    },
    auth: {
      lockTime: 15 * 60 * 1000,
      maxLoginAttempts: 5,
      verify: false,
      cookies: {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.VERCEL_URL ? `.${process.env.VERCEL_URL}` : undefined,
      },
    },
  },
  editor: defaultLexical,
  db: mongooseAdapter({
    url: process.env.DATABASE_URI,
    connectOptions: {
      retryWrites: true,
      w: 'majority',
      appName: 'ServerlessInstance0',
    },
  }),
  onInit: async (payload) => {
    // Skip during build process
    if (process.env.PAYLOAD_CONFIG_PATH) {
      console.log('[onInit] Skipping initialization during build process')
      return
    }

    try {
      // Check if "Home" space already exists
      const existing = await payload.find({
        collection: CollectionSlugs.SPACES,
        where: {
          name: { equals: 'Home' },
        },
        limit: 1,
      })

      if (existing?.docs?.length) {
        console.log('[onInit] Home space already exists.')
        return
      }

      console.log('[onInit] Creating global "Home" space...')

      // Find or create system admin user
      const adminUsers = await payload.find({
        collection: CollectionSlugs.USERS,
        where: {
          role: { equals: 'admin' },
        },
        limit: 1,
      })

      const adminUser = adminUsers?.docs?.[0]
      if (!adminUser) {
        console.error('[onInit] No admin user found to assign as Home space owner')
        return
      }

      // Create Home space
      const homeSpace = await payload.create({
        collection: CollectionSlugs.SPACES,
        data: {
          name: 'Home',
          owner: adminUser.id,
        },
      })

      // Create general channel
      const generalChannel = await payload.create({
        collection: CollectionSlugs.CHANNELS,
        data: {
          name: 'general',
          space: homeSpace.id,
          type: ChannelType.TEXT,
          description: 'General discussion channel',
        },
      })

      // Create system channel
      const systemChannel = await payload.create({
        collection: CollectionSlugs.CHANNELS,
        data: {
          name: 'system',
          space: homeSpace.id,
          type: ChannelType.TEXT,
          description: 'System announcements and notifications',
        },
      })

      // Create member record for admin
      const member = await payload.create({
        collection: CollectionSlugs.MEMBERS,
        data: {
          user: adminUser.id,
          space: homeSpace.id,
          role: MemberRole.ADMIN,
          email: adminUser.email,
        },
      })

      // Update space with channels and member
      await payload.update({
        collection: CollectionSlugs.SPACES,
        id: homeSpace.id,
        data: {
          channels: [generalChannel.id, systemChannel.id],
          members: [member.id],
        },
      })

      console.log('[onInit] Home space + general and system channels ready.')
    } catch (error) {
      console.error('[onInit] Error creating Home space:', error)
    }
  },
  collections: [
    Pages,
    Posts,
    Media,
    Categories,
    Users,
    Profiles,
    Spaces,
    Members,
    Channels,
    Messages,
    Conversations,
    DirectMessages,
    SpacesMedia,
  ],
  globals: [Header, Footer, Settings],
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
    schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  cors: [getServerSideURL()].filter(Boolean),
  plugins: [...plugins],
  secret: process.env.PAYLOAD_SECRET,
  upload: {
    limits: {
      fileSize: 5000000, // 5MB
    },
  },
  sharp,
  debug: process.env.NODE_ENV === 'development',
  csrf: [
    'https://spaces.kendev.co',
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
    'http://localhost:3000',
  ].filter(Boolean),
  rateLimit: {
    window: 15 * 60 * 1000,
    max: 100,
  },
})

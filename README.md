# Payload CMS 3.0 Website Template with Spaces!

This is an enhanced version of the official [Payload Website Template](https://github.com/payloadcms/payload/blob/main/templates/website) that includes Spaces, a **multi-space, multi-channel** communication platform inspired by Discord. This template combines a fully-working backend, enterprise-grade admin panel, and a beautifully designed website with real-time communication capabilities.

This template is right for you if you are working on:

- A personal or enterprise-grade website with real-time communication needs
- A Discord-like platform with multiple spaces and channels
- A content publishing platform with a fully featured publication workflow
- Exploring the capabilities of Payload CMS 3.0

Core features:

- [Pre-configured Payload Config](#how-it-works)
- [Authentication](#users-authentication)
- [Access Control](#access-control)
- [Layout Builder](#layout-builder)
- [Draft Preview](#draft-preview)
- [Live Preview](#live-preview)
- [Redirects](#redirects)
- [SEO](#seo)
- [Website](#website)
- [Spaces](#spaces)

## Spaces Features

The Spaces enhancement adds real-time communication capabilities:

1. **Multi-Space Architecture**

   - Organize your app into distinct "Spaces," each with independent text, audio, and video channels
   - Role-based access control for space members
   - Customizable space settings and permissions
   - Spaces are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.
   - Spaces can be created, updated, and deleted from the admin panel with the ability to add members to a space.
   - Granular permissions for each space including the ability to limit ability to create new spaces, channels, and members.

2. **Real-Time Communication**

   - Live chat updates using Server-Sent Events (SSE)
   - Direct messaging between space members
   - Channel-based conversations
   - Presence indicators for online users

3. **Modern UI Components**

   - Built with TailwindCSS and shadcn/ui
   - Responsive design for all screen sizes
   - Dark mode support
   - Beautiful gradients and animations

4. **File Sharing**
   - Secure file uploads in channels
   - Image preview and gallery view
   - Document sharing capabilities

## Quick Start

To spin up this example locally, follow these steps:

### Development Environment

1. First [clone the repo](#clone) if you have not done so already
2. `cd my-project && cp .env.example .env` to copy the example environment variables
3. `pnpm install && pnpm dev` to install dependencies and start the dev server
4. Open `http://localhost:3000` to access the app in your browser

> **Note**: A live development instance is available at https://spaces.kendev.co (please note: this instance may be slow due to resource constraints)

### Production Build

Currently, the production build is under optimization. For now, we recommend using the development server for testing and evaluation.

## Project Structure

The project follows a clear separation of concerns with route grouping:

```
src/
  ├─ app/
  │   ├─ (frontend)/
  │   │   └─ (auth)/             # Authentication routes
  │   │       ├─ login
  │   │       ├─ logout
  │   │       ├─ recover-password
  │   │       └─ reset-password
  │   ├─ (spaces)/               # Spaces-specific routes
  │   │   ├─ account
  │   │   ├─ create-account
  │   │   └─ spaces/
  │   │       └─ [spaceId]/
  │   │           ├─ channels
  │   │           ├─ conversations
  │   │           ├─ members
  │   │           └─ settings
  │   ├─ (website)/              # Main website routes
  │   │   ├─ [slug]
  │   │   ├─ next
  │   │   ├─ posts
  │   │   └─ search
  │   └─ (payload)/              # Payload admin routes
  │       ├─ admin
  │       └─ api
  └─ api/                        # API routes
      ├─ auth
      ├─ direct-messages
      ├─ livekit
      └─ messages
```

### Route Groups

- **(frontend)**: Contains public-facing website components and authentication routes
- **(spaces)**: Houses all Spaces-related functionality including account management and space interactions
- **(website)**: Manages main website content including posts and dynamic pages
- **(payload)**: Contains Payload CMS admin interface and API endpoints
- **api/**: Handles server-side API routes for real-time features and authentication

## How it works

The Payload config is tailored specifically to the needs of most websites and includes additional collections for the Spaces functionality:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Posts

  Posts are used to generated blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Categories

  A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/plugins/nested-docs) for more details.

- #### Spaces

  Spaces are the top-level organizational units that contain channels and members. Each space can have multiple channels and members with different roles.

- #### Channels

  Channels belong to spaces and can be of different types (text, audio, video). They serve as the primary means of communication within a space.

- #### Members

  Members represent users within a space and their roles/permissions. A user can be a member of multiple spaces with different roles in each.

- #### Messages
  Messages are the individual communications within channels or direct messages between members.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- `Header`

  The data required by the header on your front-end like nav links.

- `Footer`

  Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- `users`: Users can access the admin panel and create or edit content.
- `posts`: Everyone can access published posts, but only users can create, update, or delete them.
- `pages`: Everyone can access published pages, but only users can create, update, or delete them.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/rich-text/overview) docs.

## Draft Preview

All posts and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with `drafts` set to `true`. This means that when you create a new post, project, or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, posts, and projects will need to be regenerated as changes are made to published documents. To do this, we use an `afterChange` hook to regenerate the front-end when a document has changed and its `_status` is `published`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template also pre-configured with the official [Payload Saerch Plugin](https://payloadcms.com/docs/plugins/search) to showcase how SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the `redirects` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload-admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Fully featured blog
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Redirects
- Live preview

### Cache

Although Next.js includes a robust set of caching strategies out of the box, Payload Cloud proxies and caches all files through Cloudflare using the [Official Cloud Plugin](https://www.npmjs.com/package/@payloadcms/payload-cloud). This means that Next.js caching is not needed and is disabled by default. If you are hosting your app outside of Payload Cloud, you can easily reenable the Next.js caching mechanisms by removing the `no-store` directive from all fetch requests in `./src/app/_api` and then removing all instances of `export const dynamic = 'force-dynamic'` from pages files, such as `./src/app/(pages)/[slug]/page.tsx`. For more details, see the official [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching).

## Development

To spin up this example locally, follow the [Quick Start](#quick-start). Then [Seed](#seed) the database with a few pages, posts, and projects.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the `.env` file in your project root
1. Next run `docker-compose up`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, posts, and projects you can click the 'seed database' link from the admin panel.

The seed script will also create a demo user for demonstration purposes only:

- Demo Author
  - Email: `demo-author@payloadcms.com`
  - Password: `password`

> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.

## Production

To run Payload in production, you need to build and start the Admin panel. To do so, follow these steps:

1. Invoke the `next build` script by running `pnpm build` or `npm run build` in your project root. This creates a `.next` directory with a production-ready admin bundle.
1. Finally run `pnpm start` or `npm run start` to run Node in production and serve Payload from the `.build` directory.
1. When you're ready to go live, see Deployment below for more details.

### Deploying to Payload Cloud

The easiest way to deploy your project is to use [Payload Cloud](https://payloadcms.com/new/import), a one-click hosting solution to deploy production-ready instances of your Payload apps directly from your GitHub repo.

### Deploying to Vercel

This template can also be deployed to Vercel for free. You can get started by choosing the Vercel DB adapter during the setup of the template or by manually installing and configuring it:

```bash
pnpm add @payloadcms/db-vercel-postgres
```

```ts
// payload.config.ts
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

export default buildConfig({
  // ...
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  // ...
```

We also support Vercel's blob storage:

```bash
pnpm add @payloadcms/storage-vercel-blob
```

```ts
// payload.config.ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  // ...
  plugins: [
    vercelBlobStorage({
      collections: {
        [Media.slug]: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  // ...
```

There is also a simplified [one click deploy](https://github.com/payloadcms/payload/tree/templates/with-vercel-postgres) to Vercel should you need it.

### Self-hosting

Before deploying your app, you need to:

1. Ensure your app builds and serves in production. See [Production](#production) for more details.
2. You can then deploy Payload as you would any other Node.js or Next.js application either directly on a VPS, DigitalOcean's Apps Platform, via Coolify or more. More guides coming soon.

You can also deploy your app manually, check out the [deployment documentation](https://payloadcms.com/docs/production/deployment) for full details.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).

## Project Structure

A brief overview of important directories and files:

```
spaces/
  ├─ src/
  │   ├─ app/
  │   │   ├─ (spaces)/spaces/    # Main Spaces routes and channel logic
  │   │   └─ (frontend)/...      # Website pages and auth routes
  │   ├─ spaces/
  │   │   ├─ components/         # Shared UI for channels, chats, media rooms
  │   │   ├─ utilities/          # Real-time logic, SSE hooks
  │   │   └─ services/           # High-level abstractions
  │   └─ ...
  ├─ payload.config.ts           # Payload CMS config
  └─ ...
```

## Tech Stack

This template leverages modern technologies for optimal performance and developer experience:

### Frontend

- **Next.js 15.0.0** - App Router, React Server Components
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **aceternity-ui** - Beautiful animations and effects
- **magic-ui** - Additional UI components
- **vaul** - Drawer and sheet components
- **sonner** - Toast notifications
- **cmdk** - Command palette interface
- **nuqs** - URL-based state management
- **@hookform/resolvers** - Form validation
- **zod** - Schema validation
- **framer-motion** - Animation library
- **@legendapp/motion** - Performance-focused animations
- **@formkit/auto-animate** - Automatic animations

### Backend

- **Payload CMS 3.0.0** - Headless CMS and admin panel
- **drizzle-orm** - TypeScript ORM
- **neon** - Serverless Postgres database
- **@vercel/ai** - AI features integration
- **stripe** - Payment processing
- **uploadthing** - File uploads
- **resend** - Email service
- **pusher** - Real-time features

### Development & Deployment

- **TypeScript** - Type safety
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Vercel** - Deployment platform
- **Sentry** - Error tracking
- **Google Cloud Monitoring** - Performance monitoring

## Development Guidelines

### State Management

- Use URL-based state with `nuqs` for shareable UI states
- Leverage React Server Components for data fetching
- Minimize client-side JavaScript
- Handle loading and error states appropriately

### Real-time Communication

- Use Server-Sent Events (SSE) for real-time updates
- Implement proper connection cleanup
- Handle reconnection with exponential backoff
- Track message state and order

### Error Handling

- Implement proper error boundaries
- Use toast notifications for user feedback
- Log errors with context
- Provide clear error messages

### Authentication

- Use Payload's built-in authentication
- Implement proper session handling
- Configure secure cookie policies
- Set up rate limiting

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to your branch
5. Create a Pull Request

Please ensure your code follows our style guide and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

- GitHub Issues: [Create an issue](https://github.com/payloadcms/payload/issues)
- Discord: [Join our community](https://discord.com/invite/payload)
- Twitter: [@payloadcms](https://twitter.com/payloadcms)

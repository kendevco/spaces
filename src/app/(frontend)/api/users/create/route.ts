import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/spaces/utilities/payload/getPayloadClient'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, firstName, lastName, name } = body

    // Initialize Payload
    const payloadClient = await getPayloadClient()

    // Create the user
    const user = await payloadClient.create({
      collection: 'users',
      data: {
        email,
        password,
        firstName,
        lastName,
        name,
        role: 'user',
      },
    })

    // Create associated profile
    await payloadClient.create({
      collection: 'profiles',
      data: {
        name: name,
      },
    })

    // Return the user data (excluding sensitive info)
    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          name: user.name,
          role: user.role,
        },
      },
      { status: 201 },
    )
  } catch (error: any) {
    console.error('User creation error:', error)
    return NextResponse.json(
      {
        errors: [
          {
            message: error?.message || 'Error creating user',
          },
        ],
      },
      { status: 400 },
    )
  }
}

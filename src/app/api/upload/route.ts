import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { v4 as uuidv4 } from 'uuid'

import { cloudflareClient } from '@/utils/cloudflareClient'
import { supabase } from '@/utils/supabaseClient'

interface PreSignedUrlParams {
  Bucket: string
  Key: string
  Expires?: number
}
const generatePresignedUrl = async ({ Bucket, Key, Expires = 3600 }: PreSignedUrlParams) => {
  const command = new PutObjectCommand({ Bucket, Key })
  const url = await getSignedUrl(cloudflareClient, command, {
    expiresIn: Expires,
  })
  return url
}

export async function POST(req: Request) {
  const headersList = headers()
  const authorization = headersList.get('authorization')

  if (!authorization) {
    return new Response('Unauthorized', { status: 401 })
  }

  const token = authorization.split(' ')[1]
  const { data, error } = await supabase.auth.getUser(token)

  if (error || !data) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { fileType } = await req.json()

  if (!fileType) {
    return new Response('Incorrect request params', { status: 400 })
  }

  try {
    const uuid = uuidv4()
    const key = `${uuid}.${fileType.split('/')[1]}`
    const bucket = process.env.CLOUDFLARE_BUCKET_NAME!
    const url = await generatePresignedUrl({ Bucket: bucket, Key: key })
    return NextResponse.json({ url, key }, { status: 200 })
  } catch (error) {
    console.error('Upload processing error:', error)
    return new Response('Upload failed', { status: 500 })
  }
}

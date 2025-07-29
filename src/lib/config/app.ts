// App configuration
export const getAppUrl = () => {
  // In production, use the deployed URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // In Vercel, use the Vercel URL
  if (process.env.NEXT_PUBLIC_VERCEL_URL) {
    return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
  }
  
  // In development, use localhost
  return 'http://localhost:3000'
}

export const getAuthCallbackUrl = (path: string = '/auth/callback') => {
  return `${getAppUrl()}${path}`
}
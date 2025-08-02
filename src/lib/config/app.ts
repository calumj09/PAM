// App configuration
export const getAppUrl = () => {
  // Check if we're on the client side and can detect the current URL
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  // In production, use the deployed URL
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }
  
  // For Render deployments
  if (process.env.RENDER_EXTERNAL_URL) {
    return `https://${process.env.RENDER_EXTERNAL_URL}`
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
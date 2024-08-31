import { authMiddleware } from '@clerk/nextjs'
import { NextResponse } from 'next/server'


export default authMiddleware({
  publicRoutes: ['/'],
  async afterAuth(auth, req, evt) {
    const userId = auth.userId;
    const path = req.nextUrl.pathname;

    if (
      auth.userId &&
      auth.userId === process.env.NEXT_PUBLIC_ADMIN_ID &&
      !path.startsWith('/dashboard')
    ) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    if (
      auth.userId &&
      auth.userId !== process.env.NEXT_PUBLIC_ADMIN_ID &&
      path.startsWith('/dashboard')
    ) {
      return NextResponse.redirect(new URL('/', req.url))
    }

    if (!userId && (path.startsWith('/add-listing') || path.startsWith('/account') || path.startsWith('/author') || path.startsWith('/onboard'))) {
      return NextResponse.redirect(new URL('/sign-in', req.url));
    }

    if (userId && (path.startsWith('/sign-in') || path.startsWith('/sign-up'))) {
      return NextResponse.redirect(new URL('/', req.url));
    }

    if(userId && (path.startsWith('/onboard'))){
      const role = auth.sessionClaims.role;

      // Check if `role` is an empty object
      if (role && Object.keys(role).length !== 0) {
        return NextResponse.redirect(new URL('/', req.url));
      } 
    }
  },
});

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
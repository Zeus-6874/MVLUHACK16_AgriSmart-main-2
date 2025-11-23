import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
])

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  
  if (!isPublicRoute(req) && !userId) {
    const signInUrl = new URL("/sign-in", req.url)
    return NextResponse.redirect(signInUrl)
  }
})

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}

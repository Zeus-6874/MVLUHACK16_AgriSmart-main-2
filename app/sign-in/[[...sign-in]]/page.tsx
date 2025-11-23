import { SignIn } from "@clerk/nextjs"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AgriSmart</h1>
          <p className="text-gray-600">Sign in to your agricultural management dashboard</p>
        </div>
        <SignIn 
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          afterSignInUrl="/dashboard"
        />
        <p className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <a href="/sign-up" className="font-medium text-green-700 hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}

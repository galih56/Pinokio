import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link } from "@/components/ui/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-background py-6">
        <div className="container flex items-center justify-between">
          <h1 className="text-2xl font-bold">YourCompany</h1>
          <nav>
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="bg-background py-12 md:py-24 lg:py-32">
          <div className="container flex flex-col items-center space-y-4 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Submit Your Issues or Requests
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              We're here to help. Submit your business-related issues or service requests, and our team will address
              them promptly.
            </p>
            <div className="w-full max-w-sm space-y-2">
              <form className="flex space-x-2">
                <Input className="flex-1" placeholder="Enter your email" type="email" />
                <Button type="submit">Get Started</Button>
              </form>
            </div>
          </div>
        </section>
        <section className="bg-muted py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 lg:gap-10">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How It Works</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Submit your issue in three easy steps
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="font-bold">Sign Up or Login</h3>
                <p className="text-sm text-muted-foreground">Create an account or login to track your submissions</p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="font-bold">Describe Your Issue</h3>
                <p className="text-sm text-muted-foreground">
                  Provide details about your business-related issue or request
                </p>
              </div>
              <div className="flex flex-col items-center space-y-2">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="font-bold">Get a Resolution</h3>
                <p className="text-sm text-muted-foreground">
                  Our team will review and address your submission promptly
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-background py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2023 YourCompany. All rights reserved.
          </p>
          <nav className="flex gap-4">
            <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" to="#">
              Terms of Service
            </Link>
            <Link className="text-sm text-muted-foreground underline-offset-4 hover:underline" to="#">
              Privacy Policy
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}


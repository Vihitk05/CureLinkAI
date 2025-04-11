import Link from "next/link"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Shield, Database, Stethoscope, Brain, Search, Lock } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-teal-50 to-white py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 lg:pr-12 mb-10 lg:mb-0">
                <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight mb-6">
                  Secure Your Medical Records with <span className="text-teal-600">Blockchain</span> Technology
                </h1>
                <p className="text-lg text-gray-700 mb-8">
                  Curelink AI provides a decentralized platform for storing medical records securely on the blockchain,
                  with AI-powered health insights and medicine price comparison tools.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button asChild size="lg" className="bg-teal-600 hover:bg-teal-700">
                    <Link href="/register">Get Started</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="lg:w-1/2">
                <div className="relative">
                  <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <img
                      src="/hero.jpeg?height=400&width=600"
                      alt="Medical records dashboard preview"
                      className="w-full h-auto"
                    />
                  </div>
                  <div className="absolute -bottom-6 -right-6 bg-teal-100 rounded-full p-4 shadow-lg">
                    <Shield className="w-12 h-12 text-teal-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Key Features</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our platform combines blockchain security with AI-powered health tools to provide a comprehensive
                healthcare solution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Database className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Decentralized Storage</h3>
                <p className="text-gray-600">
                  Securely store your medical reports on the blockchain, ensuring data immutability and protection from
                  unauthorized access.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Stethoscope className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Hospital Integration</h3>
                <p className="text-gray-600">
                  Hospitals can submit reports using your public address, requiring your verification before permanent
                  storage.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Lock className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Private Key Authentication</h3>
                <p className="text-gray-600">
                  Secure access to your medical records using private key authentication, ensuring only you control your
                  data.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Search className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Medicine Price Comparison</h3>
                <p className="text-gray-600">
                  Compare medicine prices from various pharmacy websites to find the best deals on your prescriptions.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="bg-white rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg border border-gray-100">
                <div className="bg-teal-100 rounded-full w-14 h-14 flex items-center justify-center mb-6">
                  <Brain className="w-7 h-7 text-teal-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">AI Disease Prediction</h3>
                <p className="text-gray-600">
                  Input symptoms in plain English to get AI-powered diagnosis predictions, recommended medicines, and
                  doctor visit advice.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="bg-gradient-to-br from-teal-500 to-teal-700 rounded-xl shadow-md p-6 transition-all duration-300 hover:shadow-lg text-white">
                <h3 className="text-xl font-semibold mb-3">Ready to secure your medical data?</h3>
                <p className="mb-6">
                  Join thousands of users who trust Curelink AI for their medical record management.
                </p>
                <Button asChild variant="secondary" className="bg-white text-teal-700 hover:bg-gray-100">
                  <Link href="/register">Sign Up Now</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Our simple process ensures your medical data remains secure while being accessible when needed.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Step 1 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="absolute -top-5 -left-5 bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  1
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Register & Secure Your Key</h3>
                <p className="text-gray-600">
                  Create an account and securely store your private key, which will be shown only once during
                  registration.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="absolute -top-5 -left-5 bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  2
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Upload & Manage Records</h3>
                <p className="text-gray-600">
                  Upload your medical reports or verify and accept reports submitted by healthcare providers.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white rounded-xl shadow-md p-6 relative">
                <div className="absolute -top-5 -left-5 bg-teal-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                  3
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-4">Access Health Tools</h3>
                <p className="text-gray-600">
                  Use our AI-powered disease prediction and medicine price comparison tools to make informed health
                  decisions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-teal-600 to-teal-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="px-6 py-12 sm:px-12 sm:py-16 lg:flex lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    <span className="block">Ready to take control of your medical data?</span>
                  </h2>
                  <p className="mt-4 text-lg leading-6 text-teal-100">
                    Join Curelink AI today and experience the future of secure medical record management.
                  </p>
                </div>
                <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
                  <div className="inline-flex rounded-md shadow">
                    <Button asChild size="lg" className="bg-white text-teal-700 hover:bg-gray-100">
                      <Link href="/register">Get Started</Link>
                    </Button>
                  </div>
                  <div className="ml-3 inline-flex rounded-md shadow">
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="bg-teal-700 text-white border-teal-500 hover:bg-teal-800"
                    >
                      <Link href="/about">Learn More</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}


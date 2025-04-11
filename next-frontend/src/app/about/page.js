"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, ShieldCheck, Hospital, Key, Eye, Pill, Brain } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function AboutPage() {
  const features = [
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Decentralized Medical Storage",
      description: "Securely store medical reports on the blockchain, ensuring immutability and permanent access to your health records."
    },
    {
      icon: <Hospital className="h-8 w-8" />,
      title: "Hospital Report Submission",
      description: "Hospitals can send report requests using your public address, requiring your verification before storage."
    },
    {
      icon: <Key className="h-8 w-8" />,
      title: "Private Key Authentication",
      description: "Log in securely using your private key to manage and control access to your medical records."
    },
    {
      icon: <Eye className="h-8 w-8" />,
      title: "Public Key Access",
      description: "Authorized providers can view your records using your public key, with your permission."
    },
    {
      icon: <Pill className="h-8 w-8" />,
      title: "Medicine Price Comparison",
      description: "Compare medicine prices from various pharmacy websites to find the best deals."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI-Powered Disease Prediction",
      description: "Input symptoms in plain English to get a predicted diagnosis, recommended medicines, and doctor visit advice."
    }
  ]

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-teal-600 to-blue-600 py-20 px-4 sm:px-6 lg:px-8 text-white">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-6">About CureLink AI</h1>
            <p className="text-xl max-w-3xl mx-auto">
              Revolutionizing healthcare through blockchain technology and artificial intelligence
            </p>
          </div>
        </div>

        {/* Overview Section */}
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Vision</h2>
            <div className="max-w-3xl mx-auto">
              <p className="text-lg text-gray-600">
                CureLink AI is a decentralized medical storage system leveraging blockchain technology for secure and immutable storage of medical records. 
                Users can add their own reports, while hospitals can submit reports using a patient's public address. 
                Patients must verify and accept these records before they are permanently stored.
              </p>
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Key Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="hover:shadow-lg transition-shadow duration-300 h-full">
                  <CardHeader>
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-teal-100 rounded-lg text-teal-600">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How It Works Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">How It Works</h2>
            <div className="space-y-12">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-teal-100 p-6 rounded-full text-teal-600">
                  <ShieldCheck className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">1. Secure Medical Record Storage</h3>
                  <p className="text-gray-600">
                    Your medical records are encrypted and stored on the blockchain, ensuring they cannot be altered or deleted without your permission.
                    You maintain complete control over who can access your health information.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-blue-100 p-6 rounded-full text-blue-600">
                  <Hospital className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">2. Hospital Collaboration</h3>
                  <p className="text-gray-600">
                    Healthcare providers can request to add records to your profile using your public address.
                    You'll receive a notification to review and approve these records before they become part of your permanent medical history.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0 bg-purple-100 p-6 rounded-full text-purple-600">
                  <Brain className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">3. AI-Powered Health Insights</h3>
                  <p className="text-gray-600">
                    Our advanced AI analyzes your symptoms to provide preliminary diagnoses and treatment recommendations.
                    Combined with our medicine price comparison tool, you can make informed decisions about your healthcare.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mission Section */}
          <div className="bg-gray-50 rounded-xl p-8 md:p-12">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Our Mission</h2>
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-lg text-gray-600 mb-6">
                At CureLink AI, we believe in putting patients back in control of their healthcare data.
                By combining blockchain technology with artificial intelligence, we're creating a future where:
              </p>
              <ul className="space-y-4 text-left max-w-2xl mx-auto">
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-teal-600">•</span>
                  <span className="ml-2">Medical records are secure, portable, and interoperable</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-teal-600">•</span>
                  <span className="ml-2">Patients have complete ownership and control over their health data</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-teal-600">•</span>
                  <span className="ml-2">Healthcare decisions are informed by AI-powered insights</span>
                </li>
                <li className="flex items-start">
                  <span className="flex-shrink-0 text-teal-600">•</span>
                  <span className="ml-2">The cost of medications is transparent and affordable</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
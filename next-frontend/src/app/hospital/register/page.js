"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Hospital, CheckCircle } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function HospitalRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    licenseNumber: "",
    description: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNextStep = () => {
    // Validate step 1 fields before proceeding
    if (!formData.name || !formData.email || !formData.password || !formData.phone) {
      setError("Please fill all required fields")
      return
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    
    setError("")
    setStep(2)
    window.scrollTo(0, 0)
  }

  const handlePrevStep = () => {
    setStep(1)
    setError("")
    window.scrollTo(0, 0)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Final validation
    if (!formData.address || !formData.city || !formData.state || !formData.zipCode || !formData.licenseNumber) {
      setError("Please fill all required fields")
      return
    }
    
    setIsSubmitting(true)
    setError("")

    try {
      // Prepare data for API (remove confirmPassword as it's not needed in backend)
      const { confirmPassword, ...registrationData } = formData

      const response = await fetch("http://127.0.0.1:5000/register-hospital", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registrationData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed. Please try again.")
      }

      setIsSubmitting(false)
      setStep(3) // Success step
    } catch (err) {
      setIsSubmitting(false)
      setError(err.message)
      console.error("Registration error:", err)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center">
              <div className="bg-teal-100 rounded-full p-3">
                <Hospital className="h-8 w-8 text-teal-600" />
              </div>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold text-gray-900">Hospital Registration</h1>
            <p className="mt-2 text-sm text-gray-600">
              Register your healthcare facility to join the Curelink AI network
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          {/* Success Step */}
          {step === 3 ? (
            <Card className="md:w-1/2 mx-auto">
              <CardHeader className="text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Registration Successful!</CardTitle>
                <CardDescription>
                  Your hospital has been registered successfully on the Curelink AI platform.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-600 mb-6">
                  You can now log in to your hospital dashboard to start managing patient records securely on the
                  blockchain.
                </p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button 
                  onClick={() => router.push("/hospital/login")} 
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  Proceed to Login
                </Button>
              </CardFooter>
            </Card>
          ) : (
            /* Registration Form Steps */
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  {step === 1 ? "Account Information" : "Hospital Details"}
                </CardTitle>
                <CardDescription>
                  {step === 1
                    ? "Create your hospital administrator account"
                    : "Provide information about your healthcare facility"}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Step 1: Account Information */}
                  {step === 1 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="name">Hospital Name *</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter hospital name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="hospital@example.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="password">Password *</Label>
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            minLength={8}
                          />
                          <p className="text-xs text-gray-500">Minimum 8 characters</p>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirm Password *</Label>
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            minLength={8}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          placeholder="(123) 456-7890"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Step 2: Hospital Details */}
                  {step === 2 && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address *</Label>
                        <Input
                          id="address"
                          name="address"
                          placeholder="123 Medical Center Dr"
                          value={formData.address}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            name="city"
                            placeholder="City"
                            value={formData.city}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            name="state"
                            placeholder="State"
                            value={formData.state}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="zipCode">ZIP Code *</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            placeholder="ZIP Code"
                            value={formData.zipCode}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="licenseNumber">Medical License Number *</Label>
                        <Input
                          id="licenseNumber"
                          name="licenseNumber"
                          placeholder="Enter your medical license number"
                          value={formData.licenseNumber}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Hospital Description</Label>
                        <Textarea
                          id="description"
                          name="description"
                          placeholder="Brief description of your healthcare facility..."
                          value={formData.description}
                          onChange={handleChange}
                          rows={4}
                        />
                      </div>
                    </>
                  )}
                </form>
              </CardContent>

              {/* Form Navigation */}
              <CardFooter className="flex justify-between border-t pt-4">
                {step === 1 ? (
                  <>
                    <Button variant="outline" asChild>
                      <Link href="/">Cancel</Link>
                    </Button>
                    <Button
                      onClick={handleNextStep}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Next Step
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" onClick={handlePrevStep}>
                      Previous
                    </Button>
                    <Button
                      onClick={handleSubmit}
                      className="bg-teal-600 hover:bg-teal-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Registering...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Download, Copy, AlertTriangle, QrCode } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    age: "",
    dob: "",
    address: "",
    aadhar: ""
  })
  const [step, setStep] = useState(1)
  const [privateKey, setPrivateKey] = useState("")
  const [userId, setUserId] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleRegister = async () => {
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone) {
      setError("First name, last name, email, and phone are required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('http://127.0.0.1:5000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      setPrivateKey(data.private_key)
      setUserId(data.user_id)
      setQrCode(data.qr_code)
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyKey = () => {
    navigator.clipboard.writeText(privateKey)
    // alert("Private key copied to clipboard!")
    toast("Private key copied to clipboard!")

  }

  const handleDownloadKey = () => {
    const element = document.createElement("a")
    const file = new Blob([privateKey], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = "curelink-private-key.pem"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDownloadQR = () => {
    const element = document.createElement("a")
    element.href = `data:image/png;base64,${qrCode}`
    element.download = "curelink-private-key-qr.png"
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Create your account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link href="/login" className="font-medium text-teal-600 hover:text-teal-500">
                sign in to your existing account
              </Link>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === 1 ? (
            <Card>
              <CardHeader>
                <CardTitle>Register</CardTitle>
                <CardDescription>Enter your information to create a new account.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name*</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter your first name"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name*</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter your last name"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email*</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number*</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Enter your age"
                    value={formData.age}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    name="address"
                    placeholder="Enter your address"
                    value={formData.address}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aadhar">Aadhar Number</Label>
                  <Input
                    id="aadhar"
                    name="aadhar"
                    placeholder="Enter your Aadhar number"
                    value={formData.aadhar}
                    onChange={handleInputChange}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-teal-600 hover:bg-teal-700"
                  onClick={handleRegister}
                  disabled={isLoading || !formData.firstName || !formData.lastName || !formData.email || !formData.phone}
                >
                  {isLoading ? "Registering..." : "Register"}
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Secure Your Private Key</CardTitle>
                <CardDescription>
                  This is the only time your private key will be shown. Save it securely.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Important!</AlertTitle>
                  <AlertDescription>
                    Your private key is the only way to access your account. If you lose it, you will lose access to all
                    your medical records.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="privateKey">Your Private Key</Label>
                  <div className="relative">
                    <textarea
                      id="privateKey"
                      value={privateKey}
                      readOnly
                      className="w-full p-2 border rounded-md font-mono text-xs h-32"
                    />
                    <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={handleCopyKey}>
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                  </div>
                </div>

                {qrCode && (
                  <div className="space-y-2">
                    <Label>Private Key QR Code</Label>
                    <div className="flex flex-col items-center">
                      <img 
                        src={`data:image/png;base64,${qrCode}`} 
                        alt="Private Key QR Code" 
                        className="w-48 h-48 border rounded-md"
                      />
                      <Button 
                        onClick={handleDownloadQR} 
                        variant="outline" 
                        className="mt-2"
                        size="sm"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download QR Code
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-2">
                  <Button onClick={handleDownloadKey} variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download Key File (.pem)
                  </Button>
                  <p className="text-xs text-gray-500 text-center mt-2">Store this file in a secure location</p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 mb-4">
                  <Link href="/dashboard">Continue to Dashboard</Link>
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  By continuing, you confirm that you have saved your private key
                </p>
              </CardFooter>
            </Card>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
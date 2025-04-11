"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"
import { Upload, Copy, AlertTriangle, QrCode, Key, Tornado } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import dynamic from "next/dynamic"

// Dynamic import with proper handling
const QrReader = dynamic(
  () => import('react-qr-reader').then((mod) => mod.QrReader),
  { 
    ssr: false,
    loading: () => <p>Loading scanner...</p>
  }
)

export default function LoginPage() {
  const [privateKey, setPrivateKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const fileInputRef = useRef(null)
  const qrFileInputRef = useRef(null)

  const handleLogin = async () => {
    if (!privateKey.trim()) {
      toast.error("Private key is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch('http://127.0.0.1:5000/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ private_key: privateKey })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store user_id in localStorage
      localStorage.setItem('user_id', data.user_id)
      
      // Show success toast
      toast.success("Login Successful")

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setPrivateKey(e.target.result)
    }
    reader.readAsText(file)
  }

  const handleQRFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    try {
      const { default: jsQR } = await import('jsqr')
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      img.src = imageUrl
      
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.width = img.width
        canvas.height = img.height
        context.drawImage(img, 0, 0)
        
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height)
        
        if (code) {
          setPrivateKey(code.data)
          setError("")
        } else {
          setError("Could not read QR code. Please try again.")
        }
      }
    } catch (err) {
      setError("Failed to load QR scanner. Please try again.")
      console.error(err)
    }
  }

  const handleScan = (data) => {
    if (data) {
      setPrivateKey(data)
      setError("")
    }
  }

  const handleError = (err) => {
    console.error(err)
    setError("Error scanning QR code. Please try again.")
  }

  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  const triggerQRFileInput = () => {
    qrFileInputRef.current.click()
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Sign in to your account</h1>
            <p className="mt-2 text-sm text-gray-600">
              Or{" "}
              <Link href="/register" className="font-medium text-teal-600 hover:text-teal-500">
                register for a new account
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

          <Card>
            <CardHeader>
              <CardTitle>Login with Private Key</CardTitle>
              <CardDescription>
                Use your private key PEM file or QR code to authenticate
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="privateKey">Private Key</Label>
                <textarea
                  id="privateKey"
                  value={privateKey}
                  onChange={(e) => setPrivateKey(e.target.value)}
                  className="w-full p-2 border rounded-md font-mono text-xs h-32"
                  placeholder="Paste your private key here or upload the PEM file/QR code below"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  onClick={triggerFileInput}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Upload PEM File
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept=".pem,.txt"
                    className="hidden"
                  />
                </Button>

                <Button 
                  variant="outline" 
                  onClick={triggerQRFileInput}
                >
                  <QrCode className="mr-2 h-4 w-4" />
                  Upload QR Code
                  <input
                    type="file"
                    ref={qrFileInputRef}
                    onChange={handleQRFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                <p>Your private key should look like:</p>
                <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                  -----BEGIN RSA PRIVATE KEY-----<br />
                  MIIEpAIBAAKCAQEA...<br />
                  ...<br />
                  -----END RSA PRIVATE KEY-----
                </pre>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full bg-teal-600 hover:bg-teal-700"
                onClick={handleLogin}
                disabled={isLoading || !privateKey.trim()}
              >
                {isLoading ? "Authenticating..." : "Sign In"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, User, AlertTriangle, Shield, Lock, FileText, Search } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function PublicAccessPage() {
  const router = useRouter()
  const [fileName, setFileName] = useState("")
  const [fileContent, setFileContent] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState("")

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setError("")

    // Check if file is a PEM file
    if (!file.name.endsWith('.pem')) {
      setError("Please upload a valid PEM file (.pem extension)")
      return
    }

    try {
      const content = await readFileAsText(file)
      // Basic validation for PEM format
      if (!content.includes('-----BEGIN PUBLIC KEY-----') || !content.includes('-----END PUBLIC KEY-----')) {
        throw new Error("File doesn't contain a valid PEM formatted public key")
      }
      setFileContent(content)
    } catch (err) {
      console.error("Error reading file:", err)
      setError(err.message || "Failed to read file")
    }
  }

  const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (event) => resolve(event.target.result)
      reader.onerror = (error) => reject(error)
      reader.readAsText(file)
    })
  }

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
        setFileContent(e.target.result)
    }
    reader.readAsText(file)
  }

  const handleSearch = async () => {
    if (!fileContent) {
      setError("Please upload a valid PEM file first")
      return
    }

    setIsSearching(true)
    setError("")

    try {
      const response = await fetch("http://127.0.0.1:5000/fetch-user-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_key: fileContent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch user details")
      }

      if (data.user && data.user.id) {
        router.push(`/public-access/dashboard?user_id=${data.user.id}`)
      } else {
        throw new Error("User ID not found in response")
      }
    } catch (err) {
      console.error("Error fetching user details:", err)
      setError(err.message || "An error occurred while searching. Please try again.")
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-grow bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900">Public Record Access</h1>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              View medical records using a patient's public key
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center justify-center mb-6">
                  <div className="bg-teal-100 rounded-full p-4">
                    <Shield className="h-8 w-8 text-teal-600" />
                  </div>
                </div>

                <h2 className="text-xl font-semibold text-center mb-2">Secure Public Access</h2>
                <p className="text-center text-gray-600 mb-6">
                  Upload a patient's RSA public key file to view their medical records
                </p>

                <Alert className="mb-6">
                  <Lock className="h-4 w-4" />
                  <AlertTitle>Privacy Notice</AlertTitle>
                  <AlertDescription>
                    All access is logged on the blockchain for transparency. You will only have read-only access to records.
                  </AlertDescription>
                </Alert>

                <div className="flex flex-col space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors cursor-pointer">
                    <input
                      id="pem-upload"
                      type="file"
                      accept=".pem"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="pem-upload" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 text-sm font-medium text-gray-900">
                        {fileName ? fileName : "Click to upload PEM file"}
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Only .pem files accepted</p>
                    </label>
                  </div>

                  {fileContent && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="text-sm font-medium">Public Key Preview</span>
                      </div>
                      <pre className="mt-2 text-xs font-mono bg-white p-2 rounded overflow-x-auto">
                        {fileContent.split('\n')[0]}<br />
                        ...<br />
                        {fileContent.split('\n').slice(-1)[0]}
                      </pre>
                    </div>
                  )}

                  <Button
                    onClick={handleSearch}
                    disabled={isSearching || !fileContent}
                    className="w-full bg-teal-600 hover:bg-teal-700"
                  >
                    {isSearching ? "Verifying Key..." : "Access Records"}
                    {!isSearching && <Search className="ml-2 h-4 w-4" />}
                  </Button>
                </div>

                {error && (
                  <Alert variant="destructive" className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription className="break-all">
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-gray-500">
              <p>Example PEM file content:</p>
              <pre className="font-mono bg-gray-100 p-2 rounded mt-2 text-xs overflow-x-auto">
                -----BEGIN PUBLIC KEY-----<br />
                MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgK...<br />
                -----END PUBLIC KEY-----
              </pre>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
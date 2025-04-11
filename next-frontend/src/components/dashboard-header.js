"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Copy, CheckCircle, Download } from "lucide-react"

export default function DashboardHeader() {
  const [copied, setCopied] = useState(false)
  const [user, setUser] = useState({
    first_name: "",
    last_name: "",
    public_key: ""
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fetchUserDetails = async () => {
        try {
          const user_id = localStorage.getItem("user_id")
          if (!user_id) {
            throw new Error("User ID not found in localStorage")
          }

          const response = await fetch("http://127.0.0.1:5000/fetch-user-details", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ user_id: parseInt(user_id) })
          })

          if (!response.ok) {
            throw new Error("Failed to fetch user details")
          }

          const data = await response.json()
          setUser(data.user)
        } catch (error) {
          console.error("Error fetching user details:", error)
          // Fallback to mock data if API fails
          setUser({
            first_name: "John",
            last_name: "Doe",
            public_key: "-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw/HNDNLzV669cQfziXCB\n7C6z5pwQQau0s+03HUAQqK6Xzgo0C/SUmhWjHleohreMMFfXW1ie5AVyPAg86rTv\nbWQ5IxaY+xlQIG4539lAGdWVoBv6rUIi13Nzv1OPSA/SLARvhRNvrQ9Rgn6FXF3l\noBOsoUuPmNtbBfzx3GUVx/198jbwnzrpBDCnp7rmZtrDGzZlnO4XtZUaa5wRCFDv\nQk/hGV1R+90XLEuay5sUto95kZ64+2sm8OwLu/osd4ZdPAYmvCxjoZQadFl1y+al\nwFFfJUVQl4cpBKbzBdPt3MTgM+VmIp1vyVJajP40htI8yFrYcnpdM8VwLT2+FAAv\nNwIDAQAB\n-----END PUBLIC KEY-----"
          })
        } finally {
          setLoading(false)
        }
      }

      fetchUserDetails()
    }
  }, [])

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(user.public_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadPublicKey = () => {
    if (!user.public_key) return
    
    const blob = new Blob([user.public_key], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'public_key.pem'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-teal-600 to-teal-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-white">Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-800 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl font-bold text-white">Welcome, {user.first_name} {user.last_name}</h1>
            <p className="text-teal-100 mt-1">Manage your medical records securely on the blockchain</p>
          </div>

          <Card className="bg-white/10 backdrop-blur-sm border-none shadow-md p-3 text-white">
            <div className="flex items-center">
              <div>
                <p className="text-xs text-teal-100">Your Public Key</p>
                <p className="text-sm font-mono truncate max-w-[120px] sm:max-w-xs">
                  {user.public_key.split('\n')[0]}...{user.public_key.split('\n').slice(-1)[0]}
                </p>
              </div>
              <div className="flex ml-2 space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={handleCopyAddress}
                  title="Copy public key"
                >
                  {copied ? <CheckCircle className="h-4 w-4 text-green-300" /> : <Copy className="h-4 w-4" />}
                  <span className="sr-only">Copy public key</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20"
                  onClick={downloadPublicKey}
                  title="Download public key"
                >
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download public key</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
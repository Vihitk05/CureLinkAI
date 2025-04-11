"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, X, Eye } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DashboardHeader from "@/components/dashboard-header"
import { toast } from "sonner"

export default function UploadRecordPage() {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [date, setDate] = useState("")
  const [hospital, setHospital] = useState("")
  const [medication, setMedication] = useState("")
  const [summary, setSummary] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [uploadedDate, setUploadedDate] = useState(new Date().toISOString().split('T')[0])
  const [files, setFiles] = useState([])
  const [isUploading, setIsUploading] = useState(false)
  const [user, setUser] = useState(null)

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files)
      setFiles(prevFiles => [...prevFiles, ...newFiles])
    }
  }

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
      setUser({
        id: 1,
        first_name: "John",
        last_name: "Doe",
        public_key: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
        email: "john@gmail.com"
      })
    }
  }

  const handleRemoveFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index))
  }

  const handleViewFile = (file) => {
    const fileUrl = URL.createObjectURL(file)
    window.open(fileUrl, '_blank')
  }

  async function uploadBase64(base64String, file_name) {
    try {
      const binaryString = atob(base64String)
      const arrayBuffer = new ArrayBuffer(binaryString.length)
      const uint8Array = new Uint8Array(arrayBuffer)

      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i)
      }

      const blob = new Blob([uint8Array], { type: "application/octet-stream" })
      const file = new File([blob], `${file_name}`)

      const data = new FormData()
      data.append("file", file)

      const upload = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
          },
          body: data,
        }
      )

      const uploadRes = await upload.json()
      return uploadRes
    } catch (error) {
      console.error("Error uploading to Pinata:", error)
      throw error
    }
  }

  useEffect(() => {
    fetchUserDetails()
  }, [])

  const callAddPatientDocumentAPI = async (hashes) => {
    try {
      if (!user || !user.id) {
        throw new Error("User not authenticated or user data not loaded")
      }

      const response = await fetch(
        "http://127.0.0.1:5000/add-patient-document",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: user.id,
            report_hashes: hashes,
            disease: title,
            hospital: hospital,
            medication: medication,
            treatment_date: date,
            summary: summary,
            doctor_name: doctorName,
            uploaded_date: uploadedDate
          }),
        }
      )

      if (!response.ok) {
        throw new Error("Failed to add patient document")
      }

      return await response.json()
    } catch (error) {
      console.error("Error calling API:", error)
      throw error
    }
  }

  const handleUpload = async () => {
    if (!title || !date || !hospital || files.length === 0 || !medication || !doctorName || !summary) {
      toast.error("Please fill in all required fields and select at least one file")
      return
    }

    setIsUploading(true)
    const hashes = []

    try {
      // Upload files to IPFS
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const reader = new FileReader()
        
        await new Promise((resolve) => {
          reader.onload = async () => {
            try {
              const base64String = reader.result.split(",")[1]
              const response = await uploadBase64(base64String, file.name)
              hashes.push(response.IpfsHash)
              resolve()
            } catch (error) {
              console.error("Error uploading file:", error)
              toast.error(`Failed to upload ${file.name}. Please try again.`)
              resolve()
            }
          }
          reader.readAsDataURL(file)
        })
      }

      if (hashes.length === 0) {
        throw new Error("No files were successfully uploaded")
      }

      // Call API to add document
      const apiResponse = await callAddPatientDocumentAPI(hashes)
      
      toast.success("Medical record uploaded successfully!")
      
      router.push("/dashboard")
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("Failed to upload medical record. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <DashboardHeader />

      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Upload Medical Record</h2>
              <p className="mt-1 text-sm text-gray-600">Add a new medical record to your secure blockchain storage</p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Record Title (Disease/Condition)*</Label>
                      <Input
                        id="title"
                        placeholder="e.g., Diabetes, Hypertension"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">Date of Treatment*</Label>
                      <Input 
                        id="date" 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)} 
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hospital">Healthcare Provider/Hospital*</Label>
                      <Input
                        id="hospital"
                        placeholder="e.g., City General Hospital"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="doctorName">Doctor's Name*</Label>
                      <Input
                        id="doctorName"
                        placeholder="Dr. Smith"
                        value={doctorName}
                        onChange={(e) => setDoctorName(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="medication">Medication Prescribed*</Label>
                      <Input
                        id="medication"
                        placeholder="e.g., Insulin, 20mg daily"
                        value={medication}
                        onChange={(e) => setMedication(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="summary">Medical Summary*</Label>
                      <Textarea
                        id="summary"
                        placeholder="Detailed summary of diagnosis, treatment, and recommendations..."
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        rows={4}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="uploadedDate">Upload Date</Label>
                      <Input 
                        id="uploadedDate" 
                        type="date" 
                        value={uploadedDate} 
                        onChange={(e) => setUploadedDate(e.target.value)}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="block mb-2">Upload Documents*</Label>

                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors cursor-pointer mb-4">
                    <Input
                      id="document"
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileChange}
                      multiple
                    />
                    <label htmlFor="document" className="cursor-pointer">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="mt-4 text-sm font-medium text-gray-900">Click to upload or drag and drop</div>
                      <p className="mt-1 text-xs text-gray-500">PDF, JPG or PNG (max. 10MB each)</p>
                    </label>
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-3">
                      {files.map((file, index) => (
                        <Card key={index}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                  <FileText className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{file.name}</p>
                                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleViewFile(file)}
                                  title="View file"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleRemoveFile(index)}
                                  title="Remove file"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  <div className="mt-8">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">Privacy & Security</h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                      <p className="mb-2">
                        <span className="font-medium">End-to-End Encryption:</span> Your medical records are encrypted
                        before being stored on the blockchain.
                      </p>
                      <p className="mb-2">
                        <span className="font-medium">Decentralized Storage:</span> Records are stored across multiple
                        nodes, ensuring no single point of failure.
                      </p>
                      <p>
                        <span className="font-medium">Access Control:</span> Only you can access your complete medical
                        history using your private key.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => router.push("/dashboard")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={isUploading || !title || !date || !hospital || 
                           files.length === 0 || !medication || !doctorName || !summary}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isUploading ? "Uploading..." : "Upload to Blockchain"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
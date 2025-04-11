"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, FileText, X, AlertTriangle, CheckCircle, Trash2, Eye, User, Calendar, ClipboardList } from "lucide-react"
import Footer from "@/components/footer"
import Navbar from "@/components/hospital-navbar"
import HospitalHeader from "@/components/hospital-header"

export default function AddRecordPage() {
  const router = useRouter()
  const [publicKey, setPublicKey] = useState("")
  const [disease, setDisease] = useState("")
  const [hospital, setHospital] = useState("")
  const [medication, setMedication] = useState("")
  const [treatmentDate, setTreatmentDate] = useState("")
  const [summary, setSummary] = useState("")
  const [doctorName, setDoctorName] = useState("")
  const [uploadedDate, setUploadedDate] = useState(new Date().toISOString().split('T')[0])
  const [medicalFiles, setMedicalFiles] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState("idle")
  const [hospitalData, setHospitalData] = useState(null)

  useEffect(() => {
    // Get hospital data from localStorage
    const storedData = localStorage.getItem("hospitalData")
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      setHospitalData(parsedData)
      setHospital(parsedData.name)
    }
  }, [])

  const handleMedicalFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' // 'pending', 'uploading', 'uploaded', 'error'
      }))
      setMedicalFiles([...medicalFiles, ...newFiles])
    }
  }

  const handlePublicKeyUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      setPublicKey(e.target.result)
    }
    reader.readAsText(file)
  }

  const removeFile = (index) => {
    const updatedFiles = [...medicalFiles]
    URL.revokeObjectURL(updatedFiles[index].preview)
    updatedFiles.splice(index, 1)
    setMedicalFiles(updatedFiles)
  }

  const uploadToPinata = async (file) => {
    try {
      const base64String = await new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
          const result = reader.result
          const base64Data = result.split(',')[1] || result
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      const binaryString = atob(base64String)
      const arrayBuffer = new ArrayBuffer(binaryString.length)
      const uint8Array = new Uint8Array(arrayBuffer)

      for (let i = 0; i < binaryString.length; i++) {
        uint8Array[i] = binaryString.charCodeAt(i)
      }

      const blob = new Blob([uint8Array], { type: file.type })
      const pinataFile = new File([blob], file.name)

      const data = new FormData()
      data.append("file", pinataFile)

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

  const handleSubmit = async () => {
    if (!publicKey || !disease || !medication || !treatmentDate || !summary || !doctorName || medicalFiles.length === 0) {
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")

    try {
      // Step 1: Fetch patient ID using public key
      const userResponse = await fetch("http://127.0.0.1:5000/fetch-user-details", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ public_key: publicKey })
      })

      if (!userResponse.ok) {
        throw new Error("Failed to fetch patient details")
      }

      const userData = await userResponse.json()
      const patientId = userData.user?.id

      if (!patientId) {
        throw new Error("Patient ID not found")
      }

      // Step 2: Upload all files to IPFS
      const reportHashes = []
      
      // Update files status to uploading
      setMedicalFiles(files => files.map(f => ({ ...f, status: 'uploading' })))

      for (let i = 0; i < medicalFiles.length; i++) {
        try {
          const file = medicalFiles[i].file
          const uploadRes = await uploadToPinata(file)
          reportHashes.push(uploadRes.IpfsHash)
          
          // Update this file's status to uploaded
          setMedicalFiles(files => files.map((f, idx) => 
            idx === i ? { ...f, status: 'uploaded' } : f
          ))
        } catch (error) {
          console.error(`Error uploading file ${file.name}:`, error)
          // Update this file's status to error
          setMedicalFiles(files => files.map((f, idx) => 
            idx === i ? { ...f, status: 'error' } : f
          ))
          throw error
        }
      }

      // Step 3: Submit record to backend
      const recordResponse = await fetch("http://127.0.0.1:5000/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          public_key:publicKey,
          report_hashes: reportHashes,
          disease: disease,
          hospital: hospitalData?.name || "Unknown Hospital",
          medication: medication,
          treatment_date: treatmentDate,
          summary: summary,
          doctor_name: doctorName,
          hospital_id: hospitalData?.id,
          uploaded_date: uploadedDate
        })
      })

      if (!recordResponse.ok) {
        throw new Error("Failed to submit record")
      }

      setSubmitStatus("success")
      
      // Reset form after success (except files which we keep for reference)
      setTimeout(() => {
        setPublicKey("")
        setDisease("")
        setMedication("")
        setTreatmentDate("")
        setSummary("")
        setDoctorName("")
        setMedicalFiles([])
      }, 3000)

    } catch (error) {
      console.error("Submission error:", error)
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'uploading': return 'bg-blue-100 text-blue-800'
      case 'uploaded': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <>
    <Navbar/>
    <HospitalHeader/>
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Add Patient Medical Record</h2>
              <p className="mt-1 text-sm text-gray-600">
                Submit a new medical record to a patient's blockchain storage
              </p>
            </div>

            <div className="p-6">
              {submitStatus === "success" && (
                <Alert className="mb-6 bg-green-50 border-green-200">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Record Submitted Successfully</AlertTitle>
                  <AlertDescription className="text-green-700">
                    The medical record has been submitted to the blockchain and is pending patient approval.
                  </AlertDescription>
                </Alert>
              )}

              {submitStatus === "error" && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Submission Failed</AlertTitle>
                  <AlertDescription>
                    There was an error submitting the record. Please verify all fields and try again.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label>Patient's Public Key</Label>
                      {!publicKey ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-teal-500 transition-colors cursor-pointer">
                          <Input
                            id="publicKeyFile"
                            type="file"
                            className="hidden"
                            accept=".pem"
                            onChange={handlePublicKeyUpload}
                          />
                          <label htmlFor="publicKeyFile" className="cursor-pointer">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4 text-sm font-medium text-gray-900">Upload Public Key (PEM)</div>
                            <p className="mt-1 text-xs text-gray-500">Select patient's public key file</p>
                          </label>
                        </div>
                      ) : (
                        <Card>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="bg-teal-100 rounded-full p-2 mr-3">
                                  <FileText className="h-5 w-5 text-teal-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">Public Key</p>
                                  <p className="text-sm text-gray-500">PEM file uploaded</p>
                                </div>
                              </div>
                              <Button variant="ghost" size="icon" onClick={() => setPublicKey("")}>
                                <X className="h-4 w-4" />
                                <span className="sr-only">Remove file</span>
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="disease">Disease/Condition*</Label>
                      <Input
                        id="disease"
                        placeholder="e.g., Diabetes, Hypertension"
                        value={disease}
                        onChange={(e) => setDisease(e.target.value)}
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
                  </div>
                </div>

                <div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="hospital">Healthcare Provider/Hospital</Label>
                      <Input
                        id="hospital"
                        value={hospital}
                        onChange={(e) => setHospital(e.target.value)}
                        disabled
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="treatmentDate">Treatment Date*</Label>
                      <Input 
                        id="treatmentDate" 
                        type="date" 
                        value={treatmentDate} 
                        onChange={(e) => setTreatmentDate(e.target.value)} 
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
                      <Label>Medical Report Files*</Label>
                      {medicalFiles.length === 0 ? (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-teal-500 transition-colors cursor-pointer">
                          <Input
                            id="medicalDocuments"
                            type="file"
                            className="hidden"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={handleMedicalFileChange}
                            multiple
                          />
                          <label htmlFor="medicalDocuments" className="cursor-pointer">
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <div className="mt-4 text-sm font-medium text-gray-900">Click to upload or drag and drop</div>
                            <p className="mt-1 text-xs text-gray-500">PDF, JPG or PNG (max. 10MB each)</p>
                          </label>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-teal-500 transition-colors cursor-pointer">
                            <Input
                              id="additionalMedicalDocuments"
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleMedicalFileChange}
                              multiple
                            />
                            <label htmlFor="additionalMedicalDocuments" className="cursor-pointer flex flex-col items-center">
                              <Upload className="mx-auto h-8 w-8 text-gray-400" />
                              <div className="mt-2 text-sm font-medium text-gray-900">Add more files</div>
                            </label>
                          </div>

                          <div className="space-y-2">
                            {medicalFiles.map((file, index) => (
                              <Card key={index}>
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                      <div className="bg-teal-100 rounded-full p-2">
                                        <FileText className="h-5 w-5 text-teal-600" />
                                      </div>
                                      <div className="min-w-0">
                                        <p className="font-medium text-gray-900 truncate">{file.file.name}</p>
                                        <div className="flex items-center space-x-2">
                                          <p className="text-sm text-gray-500">{(file.file.size / 1024 / 1024).toFixed(2)} MB</p>
                                          {file.status !== 'pending' && (
                                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(file.status)}`}>
                                              {file.status}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex space-x-2">
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => window.open(file.preview, '_blank')}
                                        disabled={file.status === 'uploading'}
                                      >
                                        <Eye className="h-4 w-4" />
                                        <span className="sr-only">View file</span>
                                      </Button>
                                      <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => removeFile(index)}
                                        disabled={file.status === 'uploading'}
                                      >
                                        <Trash2 className="h-4 w-4" />
                                        <span className="sr-only">Remove file</span>
                                      </Button>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <Alert className="bg-blue-50 border-blue-200">
                      <AlertTriangle className="h-4 w-4 text-blue-600" />
                      <AlertTitle className="text-blue-800">Patient Verification Required</AlertTitle>
                      <AlertDescription className="text-blue-700">
                        After submission, the patient will need to verify and accept this record before it's permanently
                        stored on the blockchain.
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
                <Button variant="outline" onClick={() => router.push("/hospital/dashboard")}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !publicKey || !disease || !medication || !treatmentDate || !summary || !doctorName || medicalFiles.length === 0}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Record"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
    </>
    
  )
}
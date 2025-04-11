"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { FileText, Download, PlusCircle, Search, User, Hospital, Calendar, Pill, ClipboardList } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DashboardHeader from "@/components/dashboard-header"

export default function DashboardPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const patient_id = searchParams.get('user_id')
        if (!patient_id) {
          throw new Error("User ID not found in params")
        }

        const response = await fetch("http://127.0.0.1:5000/get-documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ patient_id })
        })

        if (!response.ok) {
          throw new Error("Failed to fetch documents")
        }

        const data = await response.json()
        setDocuments(data.documents || [])
      } catch (error) {
        console.error("Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [searchParams])

  const filteredDocuments = documents.filter(doc => 
    (doc.is_approved || (!doc.is_approved && !doc.is_rejected)) && (
      doc.disease?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.medication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.file_details?.some(file => 
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  )

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <DashboardHeader />

      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <h2 className="text-xl font-semibold text-gray-900">Medical Records - {filteredDocuments?.[0]?.patient_name}</h2>
              <p className="mt-1 text-sm text-gray-600">View and manage your medical history</p>
            </div>

            <div className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="relative w-full sm:w-96">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Search by disease, doctor, medication..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4 flex items-start">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="ml-4 space-y-2 flex-grow">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-4 w-[100px]" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredDocuments.length > 0 ? (
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <Card key={doc.document_id} className="hover:shadow-md transition-all duration-200 border border-gray-100">
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-full p-3 mr-4">
                            <FileText className="h-6 w-6 text-teal-700" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900 text-lg">
                                  {doc.disease || "Medical Report"}
                                </h4>
                                <div className="flex items-center mt-1 space-x-4">
                                  <Badge variant={doc.added_by_patient ? "default" : "secondary"} className="text-xs">
                                    {doc.added_by_patient ? "Patient Uploaded" : "Doctor Uploaded"}
                                  </Badge>
                                  <Badge variant={doc.is_approved ? "success" : "warning"}>
                                    {doc.is_approved ? "Approved" : "Pending"}
                                  </Badge>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                Uploaded: {formatDate(doc.uploaded_date)}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <Hospital className="h-4 w-4 mr-2 text-gray-500" />
                                <span>{doc.hospital_name || "N/A"}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Doctor: {doc.doctor_name || "N/A"}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span>Treatment Date: {formatDate(doc.treatment_date)}</span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Pill className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="truncate">{doc.medication || "N/A"}</span>
                              </div>
                            </div>

                            {doc.summary && (
                              <div className="mt-3">
                                <div className="flex items-center text-sm font-medium text-gray-600">
                                  <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>Summary</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {doc.summary}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-medium text-gray-500">ATTACHED FILES</p>
                              {doc.file_details?.map((file, fileIndex) => (
                                <div key={fileIndex} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200">
                                  <div className="flex items-center truncate">
                                    <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <span className="text-sm truncate">{file.file_name}</span>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    asChild
                                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                  >
                                    <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                                      <Download className="h-4 w-4 mr-1" /> Download
                                    </a>
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchQuery ? "No matching records found" : "No medical records"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery ? "Try a different search term" : "Get started by uploading your first medical record"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
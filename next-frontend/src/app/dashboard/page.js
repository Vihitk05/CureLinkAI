"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Upload, Bell, Search as SearchIcon, Brain, PlusCircle, Download, User, Hospital, Calendar, Pill, ClipboardList } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DashboardHeader from "@/components/dashboard-header"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("records")
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const patient_id = localStorage.getItem('user_id')
        if (!patient_id) throw new Error("Patient ID not found")

        const response = await fetch('http://127.0.0.1:5000/get-documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ patient_id })
        })

        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "Failed to fetch documents")

        setDocuments(data.documents || [])
      } catch (error) {
        toast.error(error.message)
      } finally {
        setLoading(false)
      }
    }

    if (activeTab === "records" || activeTab === "requests") fetchDocuments()
  }, [activeTab])

  // Filter documents for records tab (approved only)
  const filteredRecords = useMemo(() => {
    return documents.filter(doc => doc.is_approved && !doc.is_rejected)
  }, [documents])

  // Filter documents for pending requests tab (neither approved nor rejected)
  const pendingRequests = useMemo(() => {
    return documents.filter(doc => !doc.is_approved && !doc.is_rejected)
  }, [documents])

  // Filter records based on search query
  const filteredDocuments = useMemo(() => {
    if (!searchQuery) return filteredRecords
    return filteredRecords.filter(doc => 
      (doc.disease?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.hospital_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.medication?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.summary?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.file_details?.some(file => 
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )
  }, [filteredRecords, searchQuery])

  // Filter pending requests based on search query
  const filteredPendingRequests = useMemo(() => {
    if (!searchQuery) return pendingRequests
    return pendingRequests.filter(request => 
      (request.disease?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.hospital_name?.toLowerCase().include(searchQuery.toLowerCase())) ||
      (request.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.medication?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.summary?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (request.file_details?.some(file => 
        file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
      ))
    )
  }, [pendingRequests, searchQuery])

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const options = { year: 'numeric', month: 'short', day: 'numeric' }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const handleApprove = async (documentId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/approve-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patient_id: localStorage.getItem('user_id'),
          document_id: documentId
        })
      });
  
      if (!response.ok) throw new Error("Failed to approve document");
      
      const data = await response.json();
      toast.success("Document approved successfully");
      
      // Update local state
      setDocuments(docs => docs.map(doc => 
        doc.document_id === documentId ? { 
          ...doc, 
          is_approved: true,
          is_rejected: false 
        } : doc
      ));
    } catch (error) {
      toast.error(error.message);
    }
  };
  
  const handleReject = async (documentId) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/reject-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          patient_id: localStorage.getItem('user_id'),
          document_id: documentId
        })
      });
  
      if (!response.ok) throw new Error("Failed to reject document");
      
      const data = await response.json();
      toast.success("Document rejected successfully");
      
      // Update local state
      setDocuments(docs => docs.map(doc => 
        doc.document_id === documentId ? { 
          ...doc, 
          is_approved: false,
          is_rejected: true 
        } : doc
      ));
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />

      <DashboardHeader />

      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                <div className="p-6">
                  <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
                  <div className="mt-6 space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start hover:bg-teal-50">
                      <Link href="/dashboard/upload">
                        <Upload className="mr-2 h-4 w-4 text-teal-600" /> Upload Medical Record
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start hover:bg-teal-50">
                      <Link href="/dashboard/medicine">
                        <SearchIcon className="mr-2 h-4 w-4 text-teal-600" /> Compare Medicine Prices
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start hover:bg-teal-50">
                      <Link href="/dashboard/predict">
                        <Brain className="mr-2 h-4 w-4 text-teal-600" /> AI Disease Prediction
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <Tabs defaultValue="records" className="w-full" onValueChange={setActiveTab}>
                <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <TabsList className="grid w-full sm:w-auto grid-cols-2">
                        <TabsTrigger value="records" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800">
                          Medical Records
                        </TabsTrigger>
                        <TabsTrigger value="requests" className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800">
                          Pending Requests ({pendingRequests.length})
                        </TabsTrigger>
                      </TabsList>
                      
                      <div className="relative w-full sm:w-64">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder={`Search ${activeTab === 'records' ? 'records' : 'requests'}...`}
                          className="pl-9 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <TabsContent value="records" className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Your Medical Records</h3>
                      <Button asChild size="sm" className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
                        <Link href="/dashboard/upload">
                          <PlusCircle className="mr-2 h-4 w-4" /> Add Record
                        </Link>
                      </Button>
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
                                          {doc.added_by_patient ? "Patient Uploaded" : "Hospital Uploaded"}
                                        </Badge>
                                        <Badge variant="success">
                                          Approved
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
                                      <span>{doc.doctor_name || "N/A"}</span>
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
                        <div className="mt-6">
                          <Button asChild className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700">
                            <Link href="/dashboard/upload">
                              <PlusCircle className="mr-2 h-4 w-4" /> Add Record
                            </Link>
                          </Button>
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="requests" className="p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-lg font-medium text-gray-900">Pending Approval Requests</h3>
                      <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                        {filteredPendingRequests.length} Pending
                      </Badge>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, i) => (
                          <Card key={i} className="hover:shadow-md transition-all duration-200 border-l-4 border-yellow-400">
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <Skeleton className="h-12 w-12 rounded-full" />
                                <div className="ml-4 space-y-2 flex-grow">
                                  <Skeleton className="h-4 w-[200px]" />
                                  <Skeleton className="h-4 w-[150px]" />
                                  <div className="flex space-x-2">
                                    <Skeleton className="h-8 w-16" />
                                    <Skeleton className="h-8 w-16" />
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : filteredPendingRequests.length > 0 ? (
                      <div className="space-y-4">
                        {filteredPendingRequests.map((request) => (
                          <Card
                            key={request.document_id}
                            className="hover:shadow-md transition-all duration-200 border-l-4 border-yellow-400"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full p-3 mr-4">
                                  <Bell className="h-6 w-6 text-yellow-700" />
                                </div>
                                <div className="flex-grow">
                                  <h4 className="font-medium text-gray-900">{request.disease || "Medical Report"}</h4>
                                  
                                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Hospital className="h-4 w-4 mr-2 text-gray-500" />
                                      <span>{request.hospital_name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <User className="h-4 w-4 mr-2 text-gray-500" />
                                      <span>{request.doctor_name || "N/A"}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                      <span>Treatment Date: {formatDate(request.treatment_date)}</span>
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                      <Pill className="h-4 w-4 mr-2 text-gray-500" />
                                      <span className="truncate">{request.medication || "N/A"}</span>
                                    </div>
                                  </div>

                                  {request.summary && (
                                    <div className="mt-3">
                                      <div className="flex items-center text-sm font-medium text-gray-600">
                                        <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                                        <span>Summary</span>
                                      </div>
                                      <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                        {request.summary}
                                      </p>
                                    </div>
                                  )}

                                  <div className="mt-4 space-y-2">
                                    <p className="text-xs font-medium text-gray-500">ATTACHED FILES</p>
                                    {request.file_details?.map((file, fileIndex) => (
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

                                  <div className="mt-2">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      Pending Approval
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-4 flex justify-end space-x-3">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="border-red-300 text-red-600 hover:bg-red-50"
                                  onClick={() => handleReject(request.document_id)}
                                >
                                  Reject
                                </Button>
                                <Button 
                                  size="sm" 
                                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
                                  onClick={() => handleApprove(request.document_id)}
                                >
                                  Approve
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          {searchQuery ? "No matching requests found" : "No pending requests"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {searchQuery ? "Try a different search term" : "You don't have any pending approval requests"}
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
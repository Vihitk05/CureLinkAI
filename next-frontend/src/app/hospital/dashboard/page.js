"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, UserPlus, Clock, AlertTriangle, CheckCircle, XCircle, FileSearch, Loader2 } from "lucide-react"
import HospitalHeader from "@/components/hospital-header"
import Footer from "@/components/footer"
import Navbar from "@/components/hospital-navbar"
import { toast } from "@/components/ui/sonner"

export default function HospitalDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState([
    { title: "Total Records", value: 0, icon: FileText, color: "bg-blue-100 text-blue-600" },
    { title: "Pending Approval", value: 0, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { title: "Approved Records", value: 0, icon: CheckCircle, color: "bg-green-100 text-green-600" },
    { title: "Declined Records", value: 0, icon: XCircle, color: "bg-red-100 text-red-600" },
  ])
  const [recentActivities, setRecentActivities] = useState([])

  useEffect(() => {
    const fetchHospitalReports = async () => {
      try {
        setIsLoading(true)
        // Replace with your actual hospital ID (could be from auth context or session)
        const hospitalId = localStorage.getItem("hospital_id")
        
        const response = await fetch('http://127.0.0.1:5000/get-hospital-reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ hospital_id: hospitalId })
        })

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`)
        }

        const data = await response.json()
        
        if (data.error) {
          throw new Error(data.error)
        }

        // Calculate stats from the documents
        const documents = data.documents || []
        const totalRecords = documents.length
        const pendingApproval = documents.filter(doc => !doc.is_approved && !doc.is_rejected).length
        const approvedRecords = documents.filter(doc => doc.is_approved).length
        const declinedRecords = documents.filter(doc => doc.is_rejected).length

        // Update stats
        setStats([
          { title: "Total Records", value: totalRecords, icon: FileText, color: "bg-blue-100 text-blue-600" },
          { title: "Pending Approval", value: pendingApproval, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
          { title: "Approved Records", value: approvedRecords, icon: CheckCircle, color: "bg-green-100 text-green-600" },
          { title: "Declined Records", value: declinedRecords, icon: XCircle, color: "bg-red-100 text-red-600" },
        ])

        // Create recent activities from documents (last 5)
        const activities = documents
          .sort((a, b) => new Date(b.uploaded_date) - new Date(a.uploaded_date))
          .slice(0, 5)
          .map(doc => ({
            id: doc.document_id,
            type: doc.is_approved ? "record_approved" : doc.is_rejected ? "record_declined" : "record_added",
            patient: doc.patient_name || `Patient ${doc.patient_id}`,
            date: doc.uploaded_date,
            status: doc.is_approved ? "approved" : doc.is_rejected ? "declined" : "pending"
          }))

        setRecentActivities(activities)
        
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        })
        console.error("Error fetching hospital reports:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchHospitalReports()
  }, [])

  const getActivityIcon = (type, status) => {
    switch (type) {
      case "record_added":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "record_approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "record_declined":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  const getActivityText = (type, patient) => {
    switch (type) {
      case "record_added":
        return `Added medical record for ${patient}`
      case "record_approved":
        return `Record for ${patient} was approved`
      case "record_declined":
        return `Record for ${patient} was declined`
      default:
        return `Activity related to ${patient}`
    }
  }

  // Function to format date as YYYY-MM-DD
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <HospitalHeader />

      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-teal-600" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-center">
                        <div className={`rounded-full p-3 mr-4 ${stat.color}`}>
                          <stat.icon className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                          <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentActivities.length > 0 ? (
                        <div className="space-y-4">
                          {recentActivities.map((activity) => (
                            <div key={activity.id} className="flex items-start">
                              <div className="bg-gray-100 rounded-full p-2 mr-3">
                                {getActivityIcon(activity.type, activity.status)}
                              </div>
                              <div className="flex-grow">
                                <p className="font-medium text-gray-900">
                                  {getActivityText(activity.type, activity.patient)}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {formatDate(activity.date)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No recent activities found
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex justify-between flex-col">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button asChild className="w-full bg-teal-600 hover:bg-teal-700 justify-start">
                        <Link href="/hospital/add-record">
                          <UserPlus className="mr-2 h-4 w-4" /> Add Patient Record
                        </Link>
                      </Button>
                      <Button asChild variant="outline" className="w-full justify-start">
                        <Link href="/hospital/view-records">
                          <FileText className="mr-2 h-4 w-4" /> View All Records
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="mt-6">
                    <CardHeader className="pb-2">
                      <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Blockchain Network</span>
                          <span className="flex items-center text-green-600 text-sm">
                            <span className="h-2 w-2 rounded-full bg-green-600 mr-1.5"></span>
                            Operational
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-500">Record Storage</span>
                          <span className="flex items-center text-green-600 text-sm">
                            <span className="h-2 w-2 rounded-full bg-green-600 mr-1.5"></span>
                            Operational
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
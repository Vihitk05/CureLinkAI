"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, UserPlus, Clock, AlertTriangle, CheckCircle, XCircle, FileSearch } from "lucide-react"
import HospitalHeader from "@/components/hospital-header"
import Footer from "@/components/footer"
import Navbar from "@/components/hospital-navbar"

export default function HospitalDashboardPage() {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data for recent activities
  const recentActivities = [
    { id: 1, type: "record_added", patient: "John Doe", date: "2024-01-15T10:30:00", status: "pending" },
    { id: 2, type: "record_approved", patient: "Sarah Johnson", date: "2024-01-14T14:45:00", status: "approved" },
    { id: 3, type: "record_declined", patient: "Michael Brown", date: "2024-01-13T09:15:00", status: "declined" },
    { id: 4, type: "record_added", patient: "Emily Wilson", date: "2024-01-12T16:20:00", status: "pending" },
    { id: 5, type: "record_approved", patient: "David Miller", date: "2024-01-11T11:05:00", status: "approved" },
  ]

  // Stats data
  const stats = [
    { title: "Total Records", value: 256, icon: FileText, color: "bg-blue-100 text-blue-600" },
    { title: "Pending Approval", value: 18, icon: Clock, color: "bg-yellow-100 text-yellow-600" },
    { title: "Approved Records", value: 215, icon: CheckCircle, color: "bg-green-100 text-green-600" },
    { title: "Declined Records", value: 23, icon: XCircle, color: "bg-red-100 text-red-600" },
  ]

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <HospitalHeader />

      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                          <p className="text-sm text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
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
        </div>
      </main>

      <Footer />
    </div>
  )
}
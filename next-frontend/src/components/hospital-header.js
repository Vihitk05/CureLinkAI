"use client"

import { useState, useEffect } from "react"

export default function HospitalHeader() {
  const [hospital, setHospital] = useState({
    name: "Loading...",
    fullAddress: "Loading hospital information..."
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchHospitalData = async () => {
      try {
        // In a real app, you would get the hospital ID from auth context or localStorage
        const hospitalId = localStorage.getItem("hospitalId") || "1" // Default to 1 for demo
        
        const response = await fetch(`http://127.0.0.1:5000/api/hospital?hospital_id=${hospitalId}`)
        
        if (!response.ok) {
          throw new Error("Failed to fetch hospital data")
        }

        const data = await response.json()
        setHospital({
          name: data.name,
          fullAddress: data.fullAddress
        })
      } catch (err) {
        setError(err.message)
        setHospital({
          name: "Error Loading Data",
          fullAddress: "Could not load hospital information"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchHospitalData()
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-teal-700 to-teal-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-7 w-64 bg-teal-600 rounded mb-2"></div>
            <div className="h-4 w-80 bg-teal-600 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-gradient-to-r from-red-700 to-red-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-white">{hospital.name}</h1>
          <p className="text-red-100 mt-1">{hospital.fullAddress}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-teal-700 to-teal-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{hospital.name}</h1>
            <p className="text-teal-100 mt-1">{hospital.fullAddress}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Brain, AlertTriangle, Pill, Stethoscope, ArrowRight, Info } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DashboardHeader from "@/components/dashboard-header"

export default function DiseasePredictionPage() {
  const [symptoms, setSymptoms] = useState("")
  const [isPredicting, setIsPredicting] = useState(false)
  const [prediction, setPrediction] = useState(null)
  const [error, setError] = useState(null)

  const handlePredict = async () => {
    if (!symptoms.trim()) return

    setIsPredicting(true)
    setError(null)
    setPrediction(null)

    try {
      const response = await fetch('http://127.0.0.1:5000/api/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ symptoms: symptoms })
      })

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`)
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      // Format the response for display
      const formattedPrediction = {
        disease: data.diagnosis.disease,
        confidence: data.diagnosis.confidence || "high",
        medications: {
          source: data.medication.source,
          list: data.medication.list
        },
        advice: {
          description: data.medical_advice.description,
          treatment: data.medical_advice.treatment,
          whenToSeekHelp: data.medical_advice.when_to_seek_help,
          prevention: data.medical_advice.prevention
        }
      }

      setPrediction(formattedPrediction)
    } catch (err) {
      setError(err.message)
      console.error("Prediction error:", err)
    } finally {
      setIsPredicting(false)
    }
  }

  const renderBulletPoints = (text) => {
    if (!text) return null;
    
    // Check if text is already an array (from parsed JSON)
    if (Array.isArray(text)) {
      return (
        <ul className="list-disc pl-5 space-y-1">
          {text.map((item, index) => (
            <li key={index}>{item}</li>
          ))}
        </ul>
      )
    }
    
    // Handle string with bullet points
    if (text.includes('•') || text.includes('-')) {
      const points = text.split(/\n|•|-/).filter(point => point.trim());
      return (
        <ul className="list-disc pl-5 space-y-1">
          {points.map((point, index) => (
            <li key={index}>{point.trim()}</li>
          ))}
        </ul>
      )
    }
    
    // Fallback to simple paragraph
    return <p>{text}</p>
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <DashboardHeader />

      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">AI Disease Prediction</h2>
              <p className="mt-1 text-sm text-gray-600">
                Describe your symptoms in plain English to get a preliminary diagnosis
              </p>
            </div>

            <div className="p-6">
              <Alert className="mb-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Important Disclaimer</AlertTitle>
                <AlertDescription>
                  This tool provides preliminary information only and is not a substitute for professional medical
                  advice. Always consult a healthcare professional for proper diagnosis and treatment.
                </AlertDescription>
              </Alert>

              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="mb-6">
                <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your symptoms
                </label>
                <Textarea
                  id="symptoms"
                  placeholder="Example: I've had a fever, headache, and sore throat for the past 2 days..."
                  rows={5}
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  className="resize-none"
                />
              </div>

              <Button
                onClick={handlePredict}
                disabled={isPredicting || !symptoms.trim()}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {isPredicting ? (
                  <>Analyzing Symptoms...</>
                ) : (
                  <>
                    <Brain className="mr-2 h-4 w-4" /> Predict Possible Conditions
                  </>
                )}
              </Button>

              {prediction && (
                <div className="mt-8 space-y-6">
                  <h3 className="text-lg font-medium text-gray-900">AI Analysis Results</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Diagnosis Card */}
                    <Card className="pt-0">
                      <CardHeader className="bg-teal-50 py-[20px] rounded-t-xl">
                        <CardTitle className="flex items-center text-teal-700">
                          <Brain className="mr-2 h-5 w-5" /> Diagnosis
                        </CardTitle>
                        <CardDescription>Based on your symptoms</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-medium text-lg">{prediction.disease}</span>
                            <span className="text-sm bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                              {prediction.confidence} confidence
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full bg-teal-500"
                              style={{ width: prediction.confidence === "High" ? "90%" : "70%" }}
                            ></div>
                          </div>
                        </div>
                        
                        {prediction.advice.description && (
                          <div className="mt-4">
                            <h4 className="font-medium text-gray-900 mb-2">About the condition:</h4>
                            <p className="text-gray-700">{prediction.advice.description}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>

                    {/* Treatment Card */}
                    <Card style={{paddingTop:"0px"}}>
                      <CardHeader className="bg-blue-50 py-[20px] rounded-t-xl">
                        <CardTitle className="flex items-center text-blue-700">
                          <Pill className="mr-2 h-5 w-5" /> Recommended Medications
                        </CardTitle>
                        <CardDescription>
                          {prediction.medications.source === "from our database" 
                            ? "From our medication database" 
                            : "Suggested based on general medical knowledge"}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pt-6">
                        <ul className="list-disc pl-5 space-y-1">
                          {prediction.medications.list.map((medicine, index) => (
                            <li key={index} className="text-gray-700">
                              {medicine}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                      <CardFooter className="bg-gray-50 border-t border-gray-200">
                        <Button variant="outline" className="w-full" asChild>
                          <a href="/dashboard/medicine">
                            Compare Medicine Prices <ArrowRight className="ml-2 h-4 w-4" />
                          </a>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>

                  {/* Treatment Advice Card */}
                  <Card className="pt-0">
                    <CardHeader className="bg-purple-50 py-[20px] rounded-t-xl">
                      <CardTitle className="flex items-center text-purple-700">
                        <Stethoscope className="mr-2 h-5 w-5" /> Treatment Advice
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderBulletPoints(prediction.advice.treatment)}
                    </CardContent>
                  </Card>

                  {/* When to See Doctor Card */}
                  <Card className="pt-0">
                    <CardHeader className="bg-amber-50 py-[20px] rounded-t-xl">
                      <CardTitle className="flex items-center text-amber-700">
                        <AlertTriangle className="mr-2 h-5 w-5" /> When to Seek Medical Help
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderBulletPoints(prediction.advice.whenToSeekHelp)}
                    </CardContent>
                  </Card>

                  {/* Prevention Tips Card */}
                  <Card className="pt-0">
                    <CardHeader className="bg-green-50 py-[20px] rounded-t-xl">
                      <CardTitle className="flex items-center text-green-700">
                        <Info className="mr-2 h-5 w-5" /> Prevention Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {renderBulletPoints(prediction.advice.prevention)}
                    </CardContent>
                  </Card>

                  {/* Disclaimer */}
                  <Alert className="mt-6">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important Reminder</AlertTitle>
                    <AlertDescription>
                      This information is not a substitute for professional medical advice. 
                      Always consult a healthcare provider for diagnosis and treatment.
                    </AlertDescription>
                  </Alert>
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
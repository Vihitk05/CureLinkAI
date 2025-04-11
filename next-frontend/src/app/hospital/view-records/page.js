"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Download,
  User,
  Hospital,
  Calendar,
  Pill,
  ClipboardList,
} from "lucide-react";
import HospitalNavbar from "@/components/hospital-navbar";
import HospitalHeader from "@/components/hospital-header";
import Footer from "@/components/footer";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function HospitalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hospitalData, setHospitalData] = useState(null);

  useEffect(() => {
    const fetchHospitalRecords = async () => {
      try {
        // Get hospital data from localStorage
        const storedData = localStorage.getItem("hospitalData");
        if (!storedData) {
          throw new Error("Hospital data not found");
        }

        const hospitalData = JSON.parse(storedData);
        setHospitalData(hospitalData);

        // Fetch records from API
        const response = await fetch(
          "http://127.0.0.1:5000/get-hospital-reports",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ hospital_id: hospitalData.id }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hospital records");
        }

        const data = await response.json();
        setRecords(data.documents || []);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHospitalRecords();
  }, []);

  // Filter records based on search query
  const filteredRecords = useMemo(() => {
    if (!searchQuery) return records;
    return records.filter(
      (record) =>
        record.disease?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.hospital_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        record.doctor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.medication?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.file_details?.some((file) =>
          file.file_name.toLowerCase().includes(searchQuery.toLowerCase())
        )
    );
  }, [records, searchQuery]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <HospitalNavbar />
        <HospitalHeader />
        <main className="flex-grow bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card
                  key={i}
                  className="hover:shadow-md transition-all duration-200"
                >
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
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <HospitalNavbar />
        <HospitalHeader />
        <main className="flex-grow bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border-l-4 border-red-500 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-red-500" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HospitalNavbar />
      <HospitalHeader />

      <main className="flex-grow bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-200">
            <div className="px-4 py-5 sm:px-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Medical Records - {hospitalData?.name || "Hospital"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-600">
                    View all medical records for your hospital
                  </p>
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search records..."
                    className="pl-9 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-teal-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  Hospital Medical Records
                </h3>
                <Badge variant="outline" className="bg-teal-100 text-teal-800">
                  {filteredRecords.length} Records
                </Badge>
              </div>

              {filteredRecords.length > 0 ? (
                <div className="space-y-4">
                  {filteredRecords.map((record) => (
                    <Card
                      key={record.document_id}
                      className="hover:shadow-md transition-all duration-200 border border-gray-100"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start">
                          <div className="bg-gradient-to-br from-teal-100 to-teal-200 rounded-full p-3 mr-4">
                            <FileText className="h-6 w-6 text-teal-700" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex justify-between items-start">
                              <div>
                                <h4 className="font-medium text-gray-900 text-lg">
                                  {record.disease || "Medical Report"}
                                </h4>
                                <div className="flex items-center mt-1 space-x-4">
                                  <Badge
                                    variant={
                                      record.added_by_patient
                                        ? "default"
                                        : "secondary"
                                    }
                                    className="text-xs"
                                  >
                                    {record.added_by_patient
                                      ? "Patient Uploaded"
                                      : "Hospital Uploaded"}
                                  </Badge>
                                  <Badge
                                    variant={
                                      record.is_approved
                                        ? "success"
                                        : record.is_rejected
                                        ? "destructive"
                                        : "warning"
                                    }
                                  >
                                    {record.is_approved
                                      ? "Approved"
                                      : record.is_rejected
                                      ? "Rejected"
                                      : "Pending"}
                                  </Badge>
                                </div>
                              </div>
                              <span className="text-xs text-gray-500">
                                Uploaded: {formatDate(record.uploaded_date)}
                              </span>
                            </div>

                            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                <span>
                                  Patient: {record.patient_name || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <User className="h-4 w-4 mr-2 text-gray-500" />
                                <span>
                                  Doctor: {record.doctor_name || "N/A"}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                                <span>
                                  Treatment Date:{" "}
                                  {formatDate(record.treatment_date)}
                                </span>
                              </div>
                              <div className="flex items-center text-sm text-gray-600">
                                <Pill className="h-4 w-4 mr-2 text-gray-500" />
                                <span className="truncate">
                                  {record.medication || "N/A"}
                                </span>
                              </div>
                            </div>

                            {record.summary && (
                              <div className="mt-3">
                                <div className="flex items-center text-sm font-medium text-gray-600">
                                  <ClipboardList className="h-4 w-4 mr-2 text-gray-500" />
                                  <span>Summary</span>
                                </div>
                                <p className="mt-1 text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                  {record.summary}
                                </p>
                              </div>
                            )}

                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-medium text-gray-500">
                                ATTACHED FILES
                              </p>
                              {record.file_details?.map((file, fileIndex) => (
                                <div
                                  key={fileIndex}
                                  className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-200"
                                >
                                  <div className="flex items-center truncate">
                                    <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
                                    <span className="text-sm truncate">
                                      {file.file_name}
                                    </span>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    asChild
                                    className="text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                                  >
                                    <a
                                      href={file.file_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Download className="h-4 w-4 mr-1" />{" "}
                                      Download
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
                    {searchQuery
                      ? "No matching records found"
                      : "No medical records"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery
                      ? "Try a different search term"
                      : "No records available for this hospital"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

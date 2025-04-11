"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ExternalLink, Star } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import DashboardHeader from "@/components/dashboard-header"

export default function MedicineComparePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState([])

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)

    try {
      const response = await fetch('http://127.0.0.1:5000/fetch-medicines', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ search: searchQuery })
      });

      const data = await response.json();

      if (data.success && data.results.length > 0) {
        // Transform the API data to match our frontend structure
        const transformedResults = [{
          id: 1,
          name: data.results[0].title,
          generic: data.results[0].pack_size,
          prices: data.results.map(result => ({
            store: result.store,
            price: parseFloat(result.price),
            link: result.url,
            originalPrice: result.original_price || null,
            discount: result.discount_percentage || null
          }))
        }];

        setSearchResults(transformedResults);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Error fetching medicine data:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
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
              <h2 className="text-xl font-semibold text-gray-900">Medicine Price Comparison</h2>
              <p className="mt-1 text-sm text-gray-600">
                Compare prices of medicines across different pharmacy websites
              </p>
            </div>

            <div className="p-6">
              <div className="flex space-x-4">
                <div className="flex-grow">
                  <Input
                    placeholder="Search for a medicine (e.g., Paracetamol, Ibuprofen)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isSearching || !searchQuery.trim()}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {isSearching ? "Searching..." : "Search"}
                  {!isSearching && <Search className="ml-2 h-4 w-4" />}
                </Button>
              </div>

              {searchResults.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Search Results</h3>

                  {searchResults.map((medicine) => (
                    <Card key={medicine.id} className="mb-6">
                      <CardContent className="p-6">
                        <div className="mb-4">
                          <h4 className="text-xl font-semibold text-gray-900">{medicine.name}</h4>
                          <p className="text-sm text-gray-600">Pack Size: {medicine.generic}</p>
                        </div>

                        <Tabs defaultValue="list" className="w-full">
                          <TabsList className="grid w-full max-w-md grid-cols-2">
                            <TabsTrigger value="list">List View</TabsTrigger>
                            <TabsTrigger value="compare">Compare View</TabsTrigger>
                          </TabsList>

                          <TabsContent value="list" className="mt-4">
                            <div className="space-y-3">
                              {medicine.prices
                                .sort((a, b) => a.price - b.price)
                                .map((price, index) => (
                                  <div
                                    key={price.store}
                                    className={`flex items-center justify-between p-3 rounded-lg border ${
                                      index === 0 ? "bg-green-50 border-green-200" : "bg-white border-gray-200"
                                    }`}
                                  >
                                    <div className="flex items-center">
                                      {index === 0 && (
                                        <div className="bg-green-100 rounded-full p-1 mr-3">
                                          <Star className="h-4 w-4 text-green-600" />
                                        </div>
                                      )}
                                      <span className="font-medium">{price.store}</span>
                                    </div>
                                    <div className="flex items-center">
                                      <div className="text-right">
                                        <span className={`font-bold ${index === 0 ? "text-green-700" : "text-gray-900"}`}>
                                          ₹{price.price.toFixed(2)}
                                        </span>
                                      </div>
                                      <Button variant="ghost" size="sm" asChild className="ml-2">
                                        <a href={price.link} target="_blank" rel="noopener noreferrer">
                                          <ExternalLink className="h-4 w-4" />
                                          <span className="sr-only">Visit store</span>
                                        </a>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="compare" className="mt-4">
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Store
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Price
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Savings
                                    </th>
                                    <th
                                      scope="col"
                                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                    >
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {medicine.prices
                                    .sort((a, b) => a.price - b.price)
                                    .map((price, index) => {
                                      const lowestPrice = medicine.prices.reduce(
                                        (min, p) => (p.price < min ? p.price : min),
                                        medicine.prices[0].price,
                                      )
                                      const savings = index === 0 ? 0 : price.price - lowestPrice
                                      const savingsPercent = index === 0 ? 0 : (savings / price.price) * 100

                                      return (
                                        <tr key={price.store} className={index === 0 ? "bg-green-50" : ""}>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                              {index === 0 && (
                                                <div className="bg-green-100 rounded-full p-1 mr-2">
                                                  <Star className="h-3 w-3 text-green-600" />
                                                </div>
                                              )}
                                              <div className="text-sm font-medium text-gray-900">{price.store}</div>
                                            </div>
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            <div
                                              className={`text-sm font-bold ${index === 0 ? "text-green-700" : "text-gray-900"}`}
                                            >
                                              ₹{price.price.toFixed(2)}
                                            </div>
                                            {price.originalPrice && (
                                              <div className="text-xs text-gray-500 line-through">
                                                {price.originalPrice}
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap">
                                            {index === 0 ? (
                                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                Best Price
                                              </span>
                                            ) : (
                                              <div className="text-sm text-red-600">
                                                +₹{savings.toFixed(2)} ({savingsPercent.toFixed(0)}%)
                                              </div>
                                            )}
                                          </td>
                                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <Button variant="ghost" size="sm" asChild>
                                              <a href={price.link} target="_blank" rel="noopener noreferrer">
                                                Visit <ExternalLink className="ml-1 h-3 w-3" />
                                              </a>
                                            </Button>
                                          </td>
                                        </tr>
                                      )
                                    })}
                                </tbody>
                              </table>
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {searchQuery && !isSearching && searchResults.length === 0 && (
                <div className="mt-8 text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    We couldn't find any medicines matching "{searchQuery}". Try a different search term.
                  </p>
                </div>
              )}

              {!searchQuery && (
                <div className="mt-8 text-center py-12">
                  <Search className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Search for medicines</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Enter a medicine name to compare prices across different pharmacies.
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
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X, LogOut, User, Hospital, FileSearch } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== "undefined") {
      const user_id = localStorage.getItem("hospital_id")
      setIsLoggedIn(!!user_id)
    }
  }, [pathname])

  const isActive = (path) => {
    return pathname === path
  }

  const handleLogout = () => {
    localStorage.removeItem("hospital_id")
    localStorage.removeItem("user_type")
    setIsLoggedIn(false)
    setIsOpen(false)
    router.push("/")
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold text-teal-600">CureLink</span>
              <span className="ml-1 text-2xl font-bold text-gray-900">AI</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost" className="hover:bg-teal-50">
              <Link href="/public-access" className="flex items-center">
                <FileSearch className="h-4 w-4 mr-2" />
                Access Records
              </Link>
            </Button>

            {!isLoggedIn ? (
              <>
                <div className="flex items-center space-x-2 border-l border-gray-200 pl-4 ml-2">
                  <Button asChild variant="outline" className="flex items-center">
                    <Link href="/login">
                      <User className="h-4 w-4 mr-2" />
                      Patient Login
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="flex items-center">
                    <Link href="/hospital/login">
                      <Hospital className="h-4 w-4 mr-2" />
                      Hospital Login
                    </Link>
                  </Button>
                </div>
                <Button asChild className="bg-teal-600 hover:bg-teal-700">
                  <Link href="/register">Get Started</Link>
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-between border-b border-gray-200 py-4">
                    <div className="flex items-center">
                      <span className="text-xl font-bold text-teal-600">CureLink</span>
                      <span className="ml-1 text-xl font-bold text-gray-900">AI</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                      <X className="h-5 w-5" />
                      <span className="sr-only">Close menu</span>
                    </Button>
                  </div>
                  
                  <nav className="flex flex-col space-y-1 py-6">
                    <Link
                      href="/records"
                      className={`px-3 py-2 rounded-md text-base font-medium flex items-center ${
                        isActive("/records")
                          ? "bg-teal-50 text-teal-600"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <FileSearch className="h-4 w-4 mr-2" />
                      Access Records
                    </Link>
                  </nav>

                  <div className="mt-auto border-t border-gray-200 pt-6 pb-4">
                    <div className="flex flex-col space-y-4 px-3">
                      {!isLoggedIn ? (
                        <>
                          <Button asChild variant="outline" className="w-full flex items-center">
                            <Link href="/patient-login" onClick={() => setIsOpen(false)}>
                              <User className="h-4 w-4 mr-2" />
                              Patient Login
                            </Link>
                          </Button>
                          <Button asChild variant="outline" className="w-full flex items-center">
                            <Link href="/hospital-login" onClick={() => setIsOpen(false)}>
                              <Hospital className="h-4 w-4 mr-2" />
                              Hospital Login
                            </Link>
                          </Button>
                          <Button asChild className="w-full bg-teal-600 hover:bg-teal-700">
                            <Link href="/register" onClick={() => setIsOpen(false)}>
                              Get Started
                            </Link>
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="outline"
                          className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4 mr-2" />
                          Logout
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
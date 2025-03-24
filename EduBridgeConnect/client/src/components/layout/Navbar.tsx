import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const Navbar = () => {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;
  
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <span className="text-primary text-2xl font-bold cursor-pointer">EduBridge</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`${isActive("/") ? "border-primary text-gray-900" : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}>
                Home
              </Link>
              <Link href="#how-it-works">
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  How It Works
                </a>
              </Link>
              <Link href="#success-stories">
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  Success Stories
                </a>
              </Link>
              <Link href="#about-us">
                <a className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                  About Us
                </a>
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            {user ? (
              <>
                <Link href={user.role === "student" ? "/student/dashboard" : "/sponsor/dashboard"}>
                  <Button variant="outline">Dashboard</Button>
                </Link>
                <Button variant="outline" onClick={logout}>Log Out</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline">Log In</Button>
                </Link>
                <Link href="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="h-10 w-10">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open main menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>
                    <Link href="/" onClick={closeMobileMenu}>
                      <span className="text-primary text-2xl font-bold">EduBridge</span>
                    </Link>
                  </SheetTitle>
                  <SheetDescription>
                    Breaking financial barriers for education
                  </SheetDescription>
                </SheetHeader>
                <div className="pt-6 pb-3 space-y-1">
                  <Link href="/" onClick={closeMobileMenu}>
                    <a className={`${isActive("/") ? "bg-primary-50 border-primary text-primary-700" : "border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800"} block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}>
                      Home
                    </a>
                  </Link>
                  <Link href="#how-it-works" onClick={closeMobileMenu}>
                    <a className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      How It Works
                    </a>
                  </Link>
                  <Link href="#success-stories" onClick={closeMobileMenu}>
                    <a className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      Success Stories
                    </a>
                  </Link>
                  <Link href="#about-us" onClick={closeMobileMenu}>
                    <a className="border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800 block pl-3 pr-4 py-2 border-l-4 text-base font-medium">
                      About Us
                    </a>
                  </Link>
                </div>
                <div className="pt-4 pb-3 border-t border-gray-200">
                  <div className="flex flex-col items-stretch px-2 space-y-3">
                    {user ? (
                      <>
                        <Link href={user.role === "student" ? "/student/dashboard" : "/sponsor/dashboard"} onClick={closeMobileMenu}>
                          <Button variant="outline" className="w-full justify-center">Dashboard</Button>
                        </Link>
                        <Button variant="outline" className="w-full justify-center" onClick={() => { logout(); closeMobileMenu(); }}>
                          Log Out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={closeMobileMenu}>
                          <Button variant="outline" className="w-full justify-center">Log In</Button>
                        </Link>
                        <Link href="/register" onClick={closeMobileMenu}>
                          <Button className="w-full justify-center">Sign Up</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

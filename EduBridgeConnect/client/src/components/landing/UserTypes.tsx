import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { CheckIcon, GraduationCap, Handshake } from "lucide-react";

const UserTypes = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">Who We Serve</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">Choose your path</p>
        </div>

        <div className="mt-10 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6">
          {/* Student Card */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-primary/10 rounded-md p-3">
                  <GraduationCap className="text-primary h-6 w-6" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">For Students</h3>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Create a detailed profile showcasing your academic goals</span>
                </li>
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Apply for financial support with easy document uploads</span>
                </li>
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Get AI-powered recommendations for funding opportunities</span>
                </li>
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Access skill-based micro-jobs to earn tuition credits</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 pt-0">
              <Link href="/register">
                <Button className="w-full">Apply as Student</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Sponsor Card */}
          <Card>
            <CardHeader className="pb-1">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-amber-100 rounded-md p-3">
                  <Handshake className="text-amber-600 h-6 w-6" />
                </div>
                <h3 className="ml-4 text-lg font-medium text-gray-900">For Sponsors</h3>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Create a sponsor profile (NGO, Individual, or Corporate)</span>
                </li>
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Browse AI-ranked students based on financial need</span>
                </li>
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Make secure payments through our integrated system</span>
                </li>
                <li className="flex">
                  <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
                  <span className="ml-3 text-gray-500">Offer mentorship to sponsored students</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter className="bg-gray-50 pt-0">
              <Link href="/register">
                <Button className="w-full bg-amber-500 hover:bg-amber-600">Register as Sponsor</Button>
              </Link>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserTypes;

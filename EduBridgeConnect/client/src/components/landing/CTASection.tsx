import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const CTASection = () => {
  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
        <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
          <span className="block">Ready to join our community?</span>
          <span className="block text-primary">Start your journey today.</span>
        </h2>
        <div className="mt-8 flex flex-col sm:flex-row lg:mt-0 lg:flex-shrink-0">
          <Link href="/register">
            <Button size="lg" className="px-5 py-3">
              Apply as Student
            </Button>
          </Link>
          <Link href="/register">
            <Button
              variant="outline"
              size="lg"
              className="mt-3 sm:mt-0 sm:ml-3 px-5 py-3"
            >
              Become a Sponsor
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CTASection;

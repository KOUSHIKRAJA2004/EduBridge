const HowItWorks = () => {
  return (
    <div id="how-it-works" className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-base font-semibold text-primary tracking-wide uppercase">How It Works</h2>
          <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl sm:tracking-tight">
            Simple steps to financial freedom
          </p>
          <p className="max-w-xl mt-5 mx-auto text-xl text-gray-500">
            Our platform connects students in need with sponsors who want to make a difference.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {/* Step 1 */}
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <span className="text-lg font-bold">1</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Create Your Profile</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Register as a student or sponsor. Students share their educational goals and financial needs, while sponsors specify their support preferences.
              </dd>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <span className="text-lg font-bold">2</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">AI-Powered Matching</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Our AI system connects students with the most suitable funding opportunities and sponsors based on their unique circumstances.
              </dd>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <dt>
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary text-white">
                  <span className="text-lg font-bold">3</span>
                </div>
                <p className="ml-16 text-lg leading-6 font-medium text-gray-900">Secure Funding</p>
              </dt>
              <dd className="mt-2 ml-16 text-base text-gray-500">
                Sponsors provide financial support directly through our secure platform, and students can access funds for their educational expenses.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;

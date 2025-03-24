const Stats = () => {
  return (
    <div className="bg-primary-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">Our Impact in Numbers</h2>
          <p className="mt-3 text-xl text-primary-200 sm:mt-4">Together, we're making education accessible for everyone.</p>
        </div>
        <dl className="mt-10 text-center sm:max-w-3xl sm:mx-auto sm:grid sm:grid-cols-3 sm:gap-8">
          <div className="flex flex-col">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">Students Funded</dt>
            <dd className="order-1 text-5xl font-extrabold text-white">2,500+</dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">Active Sponsors</dt>
            <dd className="order-1 text-5xl font-extrabold text-white">350+</dd>
          </div>
          <div className="flex flex-col mt-10 sm:mt-0">
            <dt className="order-2 mt-2 text-lg leading-6 font-medium text-primary-200">Funding Provided</dt>
            <dd className="order-1 text-5xl font-extrabold text-white">$4.2M</dd>
          </div>
        </dl>
      </div>
    </div>
  );
};

export default Stats;

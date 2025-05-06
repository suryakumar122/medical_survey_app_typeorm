import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl px-4 py-8 mx-auto">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to the Medical Survey Platform
          </h1>
          <p className="text-xl text-gray-600">
            A professional platform connecting pharmaceutical companies with healthcare professionals
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-blue-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">For Doctors</h2>
            <p className="text-gray-600 mb-6">
              Share your professional insights through targeted surveys and earn points that can be redeemed for rewards.
            </p>
            <Link href="/login/doctor" className="btn-primary block text-center">
              Doctor Login
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-indigo-500">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">For Pharmaceutical Companies</h2>
            <p className="text-gray-600 mb-6">
              Create surveys to gather valuable insights from healthcare professionals and analyze the results.
            </p>
            <Link href="/login/client" className="btn-secondary block text-center">
              Client Login
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-emerald-500 mb-12">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">For Representatives</h2>
          <p className="text-gray-600 mb-6">
            Manage your assigned doctors, track their activity, and assist with onboarding.
          </p>
          <Link href="/login/rep" className="btn-success block text-center w-full md:w-1/3 mx-auto">
            Representative Login
          </Link>
        </div>

        <div className="text-center">
          <p className="text-gray-600 mb-2">Are you an administrator?</p>
          <Link href="/login/admin" className="text-indigo-600 hover:text-indigo-800 font-medium">
            Admin Login →
          </Link>
        </div>
      </div>
    </div>
  );
}

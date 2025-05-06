import { getServerSession } from "next-auth";
import { authOptions } from "@lib/auth";
import { redirect } from "next/navigation";
import DashboardLayout from "@components/layout/DashboardLayout";
import Card from "@components/ui/Card";
import Link from "next/link";
import { UserGroupIcon, CheckCircleIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { RepresentativeService } from "@services/RepresentativeService";
import { DoctorService } from "@services/DoctorService";
import { formatDate } from "@lib/utils";

export default async function RepDashboard() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "representative") {
    redirect("/login");
  }
  
  // Get representative info
  const rep = await RepresentativeService.getRepByUserId(session.user.id);
  
  if (!rep) {
    redirect("/login");
  }
  
  // Get assigned doctors
  const doctors = await DoctorService.getDoctorsByRepId(rep.id);
  
  // Calculate statistics
  const totalDoctors = doctors.length;
  const activeDoctors = doctors.filter(doctor => doctor.user.status === "active").length;
  const pendingDoctors = doctors.filter(doctor => doctor.user.status === "pending").length;
  const activationRate = totalDoctors > 0 ? Math.round((activeDoctors / totalDoctors) * 100) : 0;
  
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Welcome back, {session.user.name}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="stats-card border-l-4 border-emerald-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Total Doctors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{totalDoctors}</p>
            <p className="text-sm text-gray-500 mt-1">
              Doctors assigned to you
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-blue-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Active Doctors</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activeDoctors}</p>
            <p className="text-sm text-gray-500 mt-1">
              Doctors with active accounts
            </p>
          </Card.Content>
        </Card>
        
        <Card className="stats-card border-l-4 border-yellow-500">
          <Card.Content>
            <h3 className="text-lg font-medium text-gray-700">Activation Rate</h3>
            <p className="text-3xl font-bold text-gray-900 mt-2">{activationRate}%</p>
            <p className="text-sm text-gray-500 mt-1">
              Percentage of active doctors
            </p>
          </Card.Content>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Doctors Requiring Activation</h2>
            <Link href="/rep/activation" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <Card>
            <Card.Content>
              {pendingDoctors === 0 ? (
                <div className="text-center py-8">
                  <CheckCircleIcon className="mx-auto h-12 w-12 text-emerald-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No pending activations</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    All your assigned doctors have active accounts
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialty
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Added On
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {doctors
                        .filter(doctor => doctor.user.status === "pending")
                        .slice(0, 5)
                        .map(doctor => (
                          <tr key={doctor.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  {doctor.user.profilePicture ? (
                                    <img src={doctor.user.profilePicture} alt={doctor.user.name} className="h-10 w-10 rounded-full" />
                                  ) : (
                                    <span className="text-gray-500 text-lg font-medium">
                                      {doctor.user.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {doctor.user.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {doctor.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doctor.specialty || "Not specified"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(doctor.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/rep/doctors/${doctor.id}`}
                                className="text-emerald-600 hover:text-emerald-900"
                              >
                                Activate
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
        
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Recent Doctors</h2>
            <Link href="/rep/doctors" className="text-emerald-600 hover:text-emerald-800 text-sm font-medium">
              View All
            </Link>
          </div>
          
          <Card>
            <Card.Content>
              {totalDoctors === 0 ? (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No doctors assigned</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any doctors assigned to you yet
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Doctor
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Specialty
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {doctors
                        .slice(0, 5)
                        .map(doctor => (
                          <tr key={doctor.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  {doctor.user.profilePicture ? (
                                    <img src={doctor.user.profilePicture} alt={doctor.user.name} className="h-10 w-10 rounded-full" />
                                  ) : (
                                    <span className="text-gray-500 text-lg font-medium">
                                      {doctor.user.name.charAt(0)}
                                    </span>
                                  )}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {doctor.user.name}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {doctor.user.email}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {doctor.specialty || "Not specified"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                doctor.user.status === "active" 
                                  ? "bg-green-100 text-green-800" 
                                  : doctor.user.status === "pending" 
                                    ? "bg-yellow-100 text-yellow-800" 
                                    : "bg-gray-100 text-gray-800"
                              }`}>
                                {doctor.user.status.charAt(0).toUpperCase() + doctor.user.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Link
                                href={`/rep/doctors/${doctor.id}`}
                                className="text-emerald-600 hover:text-emerald-900"
                              >
                                View
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/rep/doctors" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-emerald-200 transition-colors">
                <UserGroupIcon className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manage Doctors</h3>
              <p className="text-sm text-gray-500">
                View and manage all doctors assigned to you
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/rep/activation" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <CheckCircleIcon className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Activation Tracking</h3>
              <p className="text-sm text-gray-500">
                Track and assist with doctor account activation
              </p>
            </Card.Content>
          </Card>
        </Link>
        
        <Link href="/rep/profile" className="block group">
          <Card className="h-full transform transition hover:shadow-lg hover:-translate-y-1">
            <Card.Content className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <UserCircleIcon className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Your Profile</h3>
              <p className="text-sm text-gray-500">
                Manage your personal information and settings
              </p>
            </Card.Content>
          </Card>
        </Link>
      </div>
    </DashboardLayout>
  );
}

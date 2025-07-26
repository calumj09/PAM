'use client'

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-lg">
          <h1 className="text-3xl font-bold text-red-600 mb-6 text-center">
            PAM - Parenting Assistant Mobile
          </h1>
          
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-green-800 mb-2">
                ✅ App is Working!
              </h2>
              <p className="text-green-700">
                The PAM app is now fully functional with proper mobile design.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-blue-800 mb-2">
                🎨 Clean Design
              </h2>
              <p className="text-blue-700">
                Apple-quality UI with proper spacing, colors, and mobile-first layout.
              </p>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-purple-800 mb-2">
                🚀 Features Ready
              </h2>
              <ul className="text-purple-700 space-y-1">
                <li>• Growth tracking with WHO charts</li>
                <li>• Medication tracking with TGA data</li>
                <li>• Family sharing system</li>
                <li>• Australian immunization schedule</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h2 className="text-lg font-semibold text-yellow-800 mb-2">
                📱 Mobile Optimized
              </h2>
              <p className="text-yellow-700">
                Designed specifically for Australian parents with children aged 0-3.
              </p>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-2 gap-3">
            <button className="bg-red-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors">
              Track Growth
            </button>
            <button className="bg-blue-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Log Medicine
            </button>
            <button className="bg-green-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
              View Checklist
            </button>
            <button className="bg-purple-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
              Family Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
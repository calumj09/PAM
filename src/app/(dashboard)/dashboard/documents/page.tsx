'use client'

import { DocumentManager } from '@/components/documents/DocumentManager'
import { 
  DocumentTextIcon,
  ShieldCheckIcon,
  CloudIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline'

export default function DocumentsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">Documents</h1>
          <p className="text-sm text-gray-600 mt-1">
            Securely store important documents
          </p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 pb-24 space-y-4">
        {/* Security Notice */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <ShieldCheckIcon className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">Secure & Private</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your documents are encrypted and stored securely. Only you can access them.
              </p>
            </div>
          </div>
        </div>

        {/* Document Manager */}
        <DocumentManager showUpload={true} />

        {/* Features Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <DocumentTextIcon className="w-4 h-4" />
            Document Features
          </h3>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CloudIcon className="w-4 h-4 text-blue-600" />
              <span>Automatic cloud backup</span>
            </div>
            <div className="flex items-center gap-2">
              <LockClosedIcon className="w-4 h-4 text-blue-600" />
              <span>End-to-end encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              <span>PDF, image, and document support</span>
            </div>
          </div>
        </div>

        {/* Usage Tips */}
        <div className="bg-gradient-to-r from-pink-100 to-orange-100 rounded-xl p-4 border border-pink-200">
          <h3 className="font-semibold text-gray-900 mb-2">💡 Organization Tips</h3>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Upload birth certificate for easy admin tasks</li>
            <li>• Store Medicare cards for quick reference</li>
            <li>• Keep immunisation records organised</li>
            <li>• Save appointment letters as they arrive</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DocumentUpload } from './DocumentUpload'
import { 
  FileText,
  Eye,
  Trash2,
  FolderOpen,
  Calendar,
  ExternalLink,
  Plus
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface Document {
  id: string
  name: string
  type: string
  size: number
  category: string
  url: string
  storage_path: string
  created_at: string
}

interface DocumentManagerProps {
  category?: string
  showUpload?: boolean
  maxFiles?: number
  className?: string
}

export function DocumentManager({ 
  category, 
  showUpload = true, 
  maxFiles = 5,
  className = ''
}: DocumentManagerProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(category || 'all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  
  const supabase = createClient()

  useEffect(() => {
    loadDocuments()
  }, [selectedCategory])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      setError('')
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('documents')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (selectedCategory !== 'all') {
        query = query.eq('category', selectedCategory)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setDocuments(data || [])

    } catch (error) {
      console.error('Error loading documents:', error)
      setError('Failed to load documents')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUploadComplete = (newDocument: Document) => {
    setDocuments(prev => [newDocument, ...prev])
    setShowUploadDialog(false)
  }

  const handleDelete = async (document: Document) => {
    if (!confirm(`Delete ${document.name}?`)) return

    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([document.storage_path])

      if (storageError) throw storageError

      // Delete from database
      const { error: dbError } = await supabase
        .from('documents')
        .delete()
        .eq('id', document.id)

      if (dbError) throw dbError

      setDocuments(prev => prev.filter(doc => doc.id !== document.id))

    } catch (error) {
      console.error('Error deleting document:', error)
      setError('Failed to delete document')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getDocumentIcon = (type: string) => {
    if (type.startsWith('image/')) return '🖼️'
    if (type === 'application/pdf') return '📄'
    return '📁'
  }

  const categories = [
    { value: 'all', label: 'All Documents', icon: '📁' },
    { value: 'birth-certificate', label: 'Birth Certificate', icon: '📄' },
    { value: 'medicare-card', label: 'Medicare Card', icon: '💳' },
    { value: 'hospital-discharge', label: 'Hospital Records', icon: '🏥' },
    { value: 'immunization-record', label: 'Immunizations', icon: '💉' },
    { value: 'government-form', label: 'Government Forms', icon: '📋' },
    { value: 'appointment-letter', label: 'Appointments', icon: '📅' },
    { value: 'insurance', label: 'Insurance', icon: '🛡️' },
    { value: 'other', label: 'Other', icon: '📁' }
  ]

  if (isLoading) {
    return (
      <div className={`${className}`}>
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-pink-50 to-orange-50 px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">My Documents</h3>
              <p className="text-sm text-gray-600">Securely store important documents</p>
            </div>
            {showUpload && (
              <button
                onClick={() => setShowUploadDialog(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Upload
              </button>
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.value
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4">
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          </div>
        )}

        {/* Documents List */}
        <div className="p-6">
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h4 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h4>
              <p className="text-gray-600 mb-4">
                {selectedCategory === 'all' 
                  ? 'Upload your first document to get started'
                  : `No ${categories.find(c => c.value === selectedCategory)?.label.toLowerCase()} found`
                }
              </p>
              {showUpload && (
                <button
                  onClick={() => setShowUploadDialog(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Upload Document
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-2xl flex-shrink-0">
                        {getDocumentIcon(document.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">{document.name}</h4>
                        <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                          <span>{formatFileSize(document.size)}</span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={document.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View document"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={document.url}
                        download={document.name}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Download document"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(document)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      {showUploadDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
            <div className="bg-gradient-to-r from-pink-50 to-orange-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Upload Documents</h3>
                <button
                  onClick={() => setShowUploadDialog(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              <div className="space-y-4">
                {categories.slice(1).map((cat) => (
                  <DocumentUpload
                    key={cat.value}
                    category={cat.value}
                    onUploadComplete={handleUploadComplete}
                    maxFiles={maxFiles}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
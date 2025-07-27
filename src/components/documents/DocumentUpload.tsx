'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Upload,
  CloudUpload,
  X,
  CheckCircle,
  AlertTriangle,
  Eye,
  Trash2
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: number
  category: string
  url: string
  created_at: string
}

interface DocumentUploadProps {
  category: string
  onUploadComplete?: (document: Document) => void
  maxFiles?: number
  allowedTypes?: string[]
  className?: string
}

export function DocumentUpload({ 
  category, 
  onUploadComplete, 
  maxFiles = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'application/pdf'],
  className = ''
}: DocumentUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const supabase = createClient()

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    
    const validFiles = Array.from(files).filter(file => {
      if (!allowedTypes.includes(file.type)) {
        setError(`${file.name} is not a supported file type`)
        return false
      }
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setError(`${file.name} is too large (max 10MB)`)
        return false
      }
      return true
    })

    if (validFiles.length > maxFiles) {
      setError(`You can only upload ${maxFiles} files at a time`)
      return
    }

    uploadFiles(validFiles)
  }

  const uploadFiles = async (files: File[]) => {
    setIsUploading(true)
    setError('')
    setSuccess('')
    setUploadProgress(0)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileExt = file.name.split('.').pop()
        const fileName = `${user.id}/${category}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`

        // Upload file to Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('documents')
          .getPublicUrl(fileName)

        // Save document metadata to database
        const { data: docData, error: dbError } = await supabase
          .from('documents')
          .insert({
            user_id: user.id,
            name: file.name,
            type: file.type,
            size: file.size,
            category: category,
            storage_path: fileName,
            url: publicUrl
          })
          .select()
          .single()

        if (dbError) throw dbError

        setUploadProgress(((i + 1) / files.length) * 100)

        if (onUploadComplete && docData) {
          onUploadComplete(docData)
        }
      }

      setSuccess(`Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`)
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

    } catch (error) {
      console.error('Upload error:', error)
      setError(error instanceof Error ? error.message : 'Failed to upload document')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const getCategoryDisplay = (category: string) => {
    const categories: { [key: string]: { name: string; icon: string } } = {
      'birth-certificate': { name: 'Birth Certificate', icon: '📄' },
      'medicare-card': { name: 'Medicare Card', icon: '💳' },
      'hospital-discharge': { name: 'Hospital Discharge', icon: '🏥' },
      'immunization-record': { name: 'Immunization Records', icon: '💉' },
      'government-form': { name: 'Government Forms', icon: '📋' },
      'appointment-letter': { name: 'Appointment Letters', icon: '📅' },
      'insurance': { name: 'Insurance Documents', icon: '🛡️' },
      'other': { name: 'Other Documents', icon: '📁' }
    }
    return categories[category] || categories['other']
  }

  const categoryInfo = getCategoryDisplay(category)

  return (
    <div className={`w-full ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
          dragActive 
            ? 'border-red-400 bg-red-50' 
            : isUploading 
              ? 'border-gray-300 bg-gray-50' 
              : 'border-gray-300 hover:border-red-400 hover:bg-red-50'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={maxFiles > 1}
          accept={allowedTypes.join(',')}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />

        <div className="text-center">
          <div className="mb-4">
            {isUploading ? (
              <CloudUpload className="w-12 h-12 text-gray-400 mx-auto animate-pulse" />
            ) : (
              <Upload className="w-12 h-12 text-gray-400 mx-auto" />
            )}
          </div>
          
          <div className="mb-2">
            <span className="text-2xl mr-2">{categoryInfo.icon}</span>
            <span className="text-lg font-semibold text-gray-900">{categoryInfo.name}</span>
          </div>
          
          {isUploading ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Uploading documents...</p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">{Math.round(uploadProgress)}% complete</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">
                PDF, JPEG, PNG, HEIC up to 10MB (max {maxFiles} files)
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-600">{success}</p>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">📸 Upload Tips</h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Take clear photos in good lighting</li>
          <li>• Ensure all text is readable</li>
          <li>• Use PDF format for official documents when possible</li>
          <li>• Keep documents safe - they'll be securely stored</li>
        </ul>
      </div>
    </div>
  )
}
'use client'
import React, { useRef, useState } from 'react'
import api from '../../lib/api'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'
import { useToast } from '../../components/Toast'

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<string[][]>([])
  const [fileName, setFileName] = useState('')
  const router = useRouter()
  const toast = useToast()

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFileName(f.name)
    Papa.parse(f, {
      complete: (results: Papa.ParseResult<string[]>) => {
        if (results.data) setPreview(results.data as string[][])
      },
      skipEmptyLines: true
    })
  }

  const submit = async () => {
    const f = fileRef.current?.files?.[0]
    if (!f) return toast.show('Choose a file first!', 'error')
    const fd = new FormData()
    fd.append('file', f)
    try {
      const res = await api.post('/vouchers/upload-csv', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      alert('Uploaded successfully: ' + JSON.stringify(res.data))
      router.push('/vouchers')
    } catch (err: any) {
      console.error(err)
      alert('Upload failed: ' + err?.message)
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Upload CSV</h2>

      <div
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-gray-400 rounded p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors mb-4"
      >
        {fileName ? (
          <p className="text-gray-700">Selected File: <span className="font-medium">{fileName}</span></p>
        ) : (
          <p className="text-gray-500">Click here or drag file to choose CSV</p>
        )}
      </div>
      <input
        type="file"
        ref={fileRef}
        accept=".csv"
        onChange={handleFile}
        className="hidden"
      />

      <div className="flex gap-2 mb-4">
        <button
          onClick={submit}
          className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Upload
        </button>
        <button
          onClick={() => router.push('/vouchers')}
          className="cursor-pointer px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
        >
          Cancel
        </button>
      </div>

      <h3 className="mt-4 mb-2">Preview</h3>
      {preview.length > 0 ? (
        <div className="overflow-auto max-h-[500px] border rounded">
          <table className="min-w-full table-auto border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="border px-2 py-1 text-left">No</th>
                {preview[0].map((header, idx) => (
                  <th key={idx} className="border px-2 py-1 text-left">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {preview.slice(1).map((row, rIdx) => (
                <tr key={rIdx} className="even:bg-gray-50">
                  <td className="border px-2 py-1">{rIdx + 1}</td>
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="border px-2 py-1">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">No preview available</p>
      )}
    </div>
  )
}

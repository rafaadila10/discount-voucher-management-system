'use client'
import React, { useRef, useState } from 'react'
import api from '../../lib/api'
import Papa from 'papaparse'
import { useRouter } from 'next/navigation'

export default function UploadPage() {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const [preview, setPreview] = useState<any[]>([])
  const router = useRouter()

  const handleFile = (e:any) => {
    const f = e.target.files[0]
    if(!f) return
    Papa.parse(f, {
      complete: (results:any) => setPreview(results.data)
    })
  }

  const submit = async () => {
    const f = fileRef.current?.files?.[0]
    if(!f) return alert('choose file')
    const fd = new FormData()
    fd.append('file', f)
    const res = await api.post('/vouchers/upload-csv', fd, { headers: {'Content-Type':'multipart/form-data'} })
    alert('uploaded: ' + JSON.stringify(res.data))
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Upload CSV</h2>
      <input type="file" ref={fileRef} accept=".csv" onChange={handleFile} />
      <div className="flex gap-2">
        <button onClick={submit} className="px-3 py-2 bg-blue-600 text-white rounded mt-2">Upload</button>
        <button
          onClick={() => router.push('/vouchers')}
          className="px-3 py-2 rounded bg-gray-200 mt-2"
        >
          Cancel
        </button>
      </div>
      <h3 className="mt-4">Preview</h3>
      <pre className="bg-white p-3 rounded">{JSON.stringify(preview.slice(0,10), null, 2)}</pre>
    </div>
  )
}

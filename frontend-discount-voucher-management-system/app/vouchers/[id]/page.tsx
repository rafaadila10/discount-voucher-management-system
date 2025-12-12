'use client'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '../../../lib/api'
import { useToast } from '../../../components/Toast'

type Form = {
  voucher_code: string
  discount_percent: number
  expiry_date: string
}

type FieldErrors = {
  voucher_code?: string
  discount_percent?: string
  expiry_date?: string
  general?: string
}

export default function VoucherForm({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params)
  const isNew = id === 'new'
  const router = useRouter()
  const toast = useToast()

  const [form, setForm] = useState<Form>({
    voucher_code: '',
    discount_percent: 1,
    expiry_date: ''
  })

  const [errors, setErrors] = useState<FieldErrors>({})
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!isNew)

  // FETCH DATA FOR EDIT
  useEffect(() => {
    if (isNew) return

    api.get('/vouchers/' + id)
      .then(res => {
        const v = res.data
        setForm({
          voucher_code: v.voucher_code,
          discount_percent: v.discount_percent,
          expiry_date: v.expiry_date
            ? new Date(v.expiry_date).toISOString().slice(0, 10)
            : ''
        })
      })
      .catch(() => {
        toast.show("Failed to fetch voucher", "error")
      })
      .finally(() => setFetching(false))
  }, [id])

  // SUBMIT
  const save = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const payload = {
        voucher_code: form.voucher_code,
        discount_percent: form.discount_percent,
        expiry_date: form.expiry_date
      }

      if (isNew) {
        await api.post('/vouchers', payload)
        toast.show("Voucher created successfully!")
      } else {
        await api.put('/vouchers/' + id, payload)
        toast.show("Voucher updated successfully!")
      }

      setTimeout(() => router.push('/vouchers'), 800)
    } catch (err: any) {
      const respErrors = err.response?.data?.errors
      if (respErrors) {
        setErrors(respErrors)
      } else {
        toast.show(err.message || "Something went wrong", "error")
      }
    }

    setLoading(false)
  }

  if (fetching) return <p className="p-4">Loading...</p>

  return (
    <div className="max-w-lg mx-auto bg-white p-6 shadow rounded">
      <h2 className="text-xl mb-4 font-semibold">
        {isNew ? 'Create Voucher' : 'Edit Voucher'}
      </h2>

      <form onSubmit={save} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">Voucher Code</label>
          <input
            className={`border px-3 py-2 rounded w-full ${errors.voucher_code ? 'border-red-500' : ''}`}
            value={form.voucher_code}
            onChange={e => setForm({ ...form, voucher_code: e.target.value })}
          />
          {errors.voucher_code && (
            <p className="text-red-500 text-sm mt-1">{errors.voucher_code}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Discount (%)</label>
          <input
            type="number"
            className={`border px-3 py-2 rounded w-full ${errors.discount_percent ? 'border-red-500' : ''}`}
            value={form.discount_percent}
            onChange={e => setForm({ ...form, discount_percent: Number(e.target.value) })}
          />
          {errors.discount_percent && (
            <p className="text-red-500 text-sm mt-1">{errors.discount_percent}</p>
          )}
        </div>

        <div>
          <label className="block mb-1 font-medium">Expiry Date</label>
          <input
            type="date"
            className={`border px-3 py-2 rounded w-full ${errors.expiry_date ? 'border-red-500' : ''}`}
            value={form.expiry_date}
            onChange={e => setForm({ ...form, expiry_date: e.target.value })}
          />
          {errors.expiry_date && (
            <p className="text-red-500 text-sm mt-1">{errors.expiry_date}</p>
          )}
        </div>

        {errors.general && (
          <p className="text-red-500 text-sm mt-1">{errors.general}</p>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className={`px-4 py-2 rounded text-white 
              ${loading ? 'bg-blue-300' : 'bg-blue-600'}
            `}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={() => router.push('/vouchers')}
            className="px-4 py-2 rounded bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

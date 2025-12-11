'use client'
import React, { useEffect, useState } from 'react'
import api from '../../lib/api'
import Link from 'next/link'

type Voucher = {
  id: number
  voucher_code: string
  discount_percent: number
  expiry_date: string
}

export default function VouchersPage() {
  const [data, setData] = useState<Voucher[] | null>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const pageSize = 10
  const [sortBy, setSortBy] = useState('expiry_date')
  const [order, setOrder] = useState<'asc'|'desc'>('asc')
  const fetchData = async () => {
    try {
      const res = await api.get('/vouchers', { params: { page, page_size: pageSize, search, sort_by: sortBy, order } })
      setData(res.data.data)
      setTotal(res.data.total)
    } catch (e) {
      console.error(e)
      if (e?.response?.status === 401) window.location.href = '/login'
    }
  }
  useEffect(()=>{ fetchData() }, [page, search, sortBy, order])

  const del = async (id:number) => {
    if (!confirm('delete?')) return
    await api.delete('/vouchers/'+id)
    fetchData()
  }

  const exportCSV = async () => {
    const res = await api.get('/vouchers/export', { responseType: 'blob' })
    const blob = new Blob([res.data], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'vouchers.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="space-x-3">
          <Link href="/vouchers/new" className="px-3 py-2 bg-green-600 text-white rounded">Create New Voucher</Link>
          <button onClick={exportCSV} className="px-3 py-2 bg-slate-700 text-white rounded">Export CSV</button>
          <Link href="/upload" className="px-3 py-2 bg-indigo-600 text-white rounded">Upload CSV</Link>
        </div>
        <div>
          <input placeholder="search code" value={search} onChange={(e)=>{ setSearch(e.target.value); setPage(1) }} className="border px-2 py-1 rounded" />
        </div>
      </div>

      <div className="mb-3">
        <label>Sort by:</label>
        <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="ml-2 border px-2 py-1 rounded">
          <option value="expiry_date">Expiry Date</option>
          <option value="discount_percent">Discount %</option>
        </select>
        <select value={order} onChange={(e)=>setOrder(e.target.value as any)} className="ml-2 border px-2 py-1 rounded">
          <option value="asc">Asc</option>
          <option value="desc">Desc</option>
        </select>
      </div>

      <table className="w-full bg-white shadow rounded">
        <thead>
          <tr className="text-left">
            <th className="p-3">No</th>
            <th className="p-3">Voucher Code</th>
            <th className="p-3">Discount (%)</th>
            <th className="p-3">Expiry Date</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>

        <tbody>
          {(!data || data.length === 0) ? (
            <tr>
              <td colSpan={5} className="text-center p-4 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            data.map((v, i) => (
              <tr key={v.id} className="border-t">
                <td className="p-3">{(page - 1) * pageSize + i + 1}</td>
                <td className="p-3">{v.voucher_code}</td>
                <td className="p-3">{v.discount_percent}</td>
                <td className="p-3">
                  {new Date(v.expiry_date).toISOString().slice(0, 10)}
                </td>
                <td className="p-3">
                  <Link href={`/vouchers/${v.id}`} className="text-blue-600 mr-3">
                    Edit
                  </Link>
                  <button onClick={() => del(v.id)} className="text-red-600">
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>


      <div className="mt-4">
        <button disabled={page<=1} onClick={()=>setPage(page-1)} className="px-3 py-1 bg-slate-200 rounded mr-2">Prev</button>
        <span>{page}</span>
        <button disabled={page*pageSize >= total} onClick={()=>setPage(page+1)} className="px-3 py-1 bg-slate-200 rounded ml-2">Next</button>
      </div>
    </div>
  )
}

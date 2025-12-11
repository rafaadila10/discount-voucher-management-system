'use client'
import React, { useState } from 'react'
import api from '../../lib/api'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const router = useRouter()

  const submit = async (e:any) => {
    e.preventDefault()
    try {
      const res = await api.post('/login', { email, password })
      localStorage.setItem('token', res.data.token)
      router.push('/vouchers')
    } catch (err:any) {
      alert('login failed')
    }
  }

  return (
    <div>
      <h2 className="text-xl mb-4">Login (dummy)</h2>
      <form onSubmit={submit} className="space-y-3">
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={(e)=>setEmail(e.target.value)} className="border px-2 py-1 rounded w-full" />
        </div>
        <div>
          <label>Password</label><br/>
          <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} className="border px-2 py-1 rounded w-full" />
        </div>
        <div>
          <button type="submit" className="px-3 py-2 bg-blue-600 text-white rounded">Login</button>
        </div>
      </form>
    </div>
  )
}

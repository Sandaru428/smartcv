'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClientPub } from '@/utils/supabase/server'

export async function signin(formData: FormData) {
  const supabase = await createClientPub()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/home')
}

export async function signup(formData: FormData) {

  const email = (formData.get('email') as string) || ''
  const password = (formData.get('password') as string) || ''
  const fname = (formData.get('fname') as string) || ''
  const lname = (formData.get('lname') as string) || ''

  if (!email || !password) {
    redirect('/error')
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const res = await fetch(`${base}/api/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, fname, lname }),
  })

  const json = await res.json()
  if (!res.ok || json.error) {
    console.error("Signup error:", json)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect(`/emailverify?email=${encodeURIComponent(email)}`)
}


export async function signout() {
  const supabase = await createClientPub()

  // Check if a user's logged in
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    await supabase.auth.signOut()
  }

  revalidatePath('/', 'layout')
  redirect('/signin')
}
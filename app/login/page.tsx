// app/login/page.tsx
'use server'
import api from '@/lib/api'
import { AxiosError } from 'axios'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function LoginPage() {
  async function handleLogin(formData: FormData) {
    'use server'

    const email = formData.get('email') as string
    const password = formData.get('password') as string

    let res;

    try{
      res = await api.post('/auth/login', { email, password });

    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const message = axiosError.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(message);
    }

    try{
      const token = res.data.token

      const cookieStore = await cookies()
  
      cookieStore.set('token', token, {
        httpOnly: true,
        path: '/',
        maxAge: 60 * 60 * 12,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }
    catch (error: unknown) {
      let message = 'Error in setting Cookies';
      if (error instanceof Error) {
        message += `: ${error.message}`;
      }
      throw new Error(message);
    }

    redirect('/')
  }

  return (
    <div className="flex flex-col items-center mt-4 mx-auto lg:py-0">
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 border-blue-300">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Sign in to your account
                </h1>
                <form className="space-y-4 md:space-y-6" action={handleLogin}>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input type="email" name="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-blue-600 focus:border-blue-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800" />
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                            </div>
                        </div>
                    </div>
                    <button type="submit" className="w-full text-white cursor-pointer bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Sign in</button>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don’t have an account yet? <Link href="/register" className="font-medium text-blue-600 hover:underline dark:text-blue-500">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
  )
}

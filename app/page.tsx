import SeatBooking from '@/components/seat';
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function HomePage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value

  if (!token) {
    console.log('Token is not found redirected to the login');
    redirect('/login')
  }
  return (
    <SeatBooking/>
  )
}

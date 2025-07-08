
import { notFound } from 'next/navigation'
import PublicBooking from '@/components/PublicBooking'

interface Props {
  params: {
    professor: string
    id: string
  }
}

export default async function PublicBookingPage({ params }: Props) {
  // Fetch teacher data from API
  const response = await fetch(`${process.env.NEXTAUTH_URL}/api/teachers/${params.id}`, {
    cache: 'no-store'
  })
  
  if (!response.ok) {
    notFound()
  }
  
  const teacher = await response.json()
  
  return <PublicBooking teacher={teacher} />
}

export async function generateMetadata({ params }: Props) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/teachers/${params.id}`)
    if (!response.ok) throw new Error('Teacher not found')
    
    const teacher = await response.json()
    
    return {
      title: `Agendar aula com ${teacher.name} - Aula Mágica`,
      description: `Agende sua aula particular com ${teacher.name}. Valor: ${teacher.currency} ${teacher.price}`,
    }
  } catch {
    return {
      title: 'Professor não encontrado - Aula Mágica',
    }
  }
}

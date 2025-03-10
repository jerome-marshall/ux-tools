import { redirect } from 'next/navigation'
import { PATH } from '@/utils/urls'

export default function TestsPage() {
  return redirect(PATH.dashboard)
}

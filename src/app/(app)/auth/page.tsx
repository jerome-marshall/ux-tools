import { PATH } from '@/utils/urls'
import { redirect } from 'next/navigation'

const AuthPage = () => {
  return redirect(PATH.authSignIn)
}

export default AuthPage

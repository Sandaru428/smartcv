import AccountForm from '@/components/profile/account-form'
import { createClientPub } from '@/utils/supabase/server'

export default async function Home() {
    const supabase = await createClientPub()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return <AccountForm user={user} />
}
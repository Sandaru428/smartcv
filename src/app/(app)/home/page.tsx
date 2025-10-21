import AccountForm from '@/components/profile/account-form'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
    const supabase = await createClient()

    const {
        data: { user },
    } = await supabase.auth.getUser()

    return <AccountForm user={user} />
}
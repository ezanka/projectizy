
import Link from 'next/link';
import { Button } from '@/src/components/ui/shadcn/button';
import { getUser } from '@/src/lib/auth-server';
import { redirect } from 'next/navigation';

export default async function Home() {
    const user = await getUser();
    if (user) {
        redirect('/dashboard/org');
    }
    
    return (
        <main className='flex min-h-screen flex-col items-center gap-8 p-24'>
            <h1>Welcome to the Home Page</h1>
            <div className='flex gap-4'>
                <Button><Link href="/auth/signup">S&apos;inscrire</Link></Button>
                <Button><Link href="/auth/signin">Se connecter</Link></Button>
            </div>
        </main>
    );
}

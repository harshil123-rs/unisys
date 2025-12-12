import Dashboard from '@/components/Dashboard';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/login');
            } else {
                setLoading(false);
            }
        };
        checkUser();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <Loader2 size={32} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return <Dashboard />;
}

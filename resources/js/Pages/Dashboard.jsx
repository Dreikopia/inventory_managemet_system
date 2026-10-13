import AppLayout from '@/Layouts/AppLayout';

const Dashboard = () => {
    return (
        <>
            <div className="rounded-xl border border-sidebar-border bg-card p-6">
                <h1 className="text-2xl font-semibold tracking-tight">Top Selling items</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                    Welcome to AirCare.
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {['Products', 'Low Stock', 'Out of stock'].map((label) => (
                    <div key={label} className="rounded-xl border border-sidebar-border bg-card p-4">
                        <p className="text-sm text-muted-foreground">{label}</p>
                        <p className="mt-2 text-2xl font-semibold tabular-nums">—</p>
                    </div>
                ))}
            </div>



        </>
    )
}

Dashboard.layout = (page) => <AppLayout>{page}</AppLayout>;

export default Dashboard;

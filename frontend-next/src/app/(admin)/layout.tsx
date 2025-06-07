

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen">

            <main className="flex-1 ml-64">
                {children}
            </main>
        </div>
    );
} 
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useTheme } from '@/hooks/use-theme';
import AppSidebar from '@/components/app-sidebar';

const AppLayout = ({ children }) => {
    const { resolvedTheme, toggleTheme } = useTheme();

    return (
        <TooltipProvider>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b border-sidebar-border px-4">
                        <SidebarTrigger className="-ml-1" />
                        <span className="text-sm font-medium text-muted-foreground">AirCare</span>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="ml-auto"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {resolvedTheme === 'dark' ? <Moon /> : <Sun />}
                        </Button>
                    </header>
                    <main className="flex flex-1 flex-col gap-4 p-4">{children}</main>
                </SidebarInset>
            </SidebarProvider>
        </TooltipProvider>
    );
};

export default AppLayout;

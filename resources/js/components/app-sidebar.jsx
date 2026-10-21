import { Link, router, usePage } from '@inertiajs/react';
import {
    Boxes,
    FileChartColumn,
    LayoutDashboard,
    LogOutIcon,
    Package,
    Settings,
    ShoppingCart,
    Tag,
    Wind,
    PackagePlus,
    PackageMinus,
    ArrowLeftRight,
    ChartPie,
    Truck,
    SlidersHorizontal
} from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from '@/components/ui/sidebar';
import { ChevronRight } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from '@/components/ui/sidebar';

const navGroups = [
    {
        label: 'General',
        items: [
            { title: 'Dashboard', href: '/', icon: LayoutDashboard },
            { title: 'Sales', href: '/sales', icon: ShoppingCart },
            { title: 'Reports', href: '/reports', icon: FileChartColumn },
        ],
    },
    {
        label: 'Catalog',
        items: [
            { title: 'Products', href: '/products', icon: Package },
            { title: 'category', href: '/categories', icon: Tag },
            { title: 'Suppliers', href: '/supplier', icon: Truck },
        ]
    },

    {
        label: 'Management',
        items: [
            {
                title: 'Inventory',
                icon: Boxes,
                children: [
                    { title: 'Overview', href: '/overview', icon: ChartPie },
                    { title: 'Stock In', href: '/stockin', icon: PackagePlus },
                    { title: 'Stock Out', href: '/stockout', icon: PackageMinus },
                    { title: 'Movements', href: '/movements', icon: ArrowLeftRight },
                    { title: 'Adjustments', href: '/adjusments', icon: SlidersHorizontal },
                ],
            }
        ],
    },
];

const isActivePath = (currentPath, href) =>
    href === '/' ? currentPath === '/' : currentPath.startsWith(href);

const AppSidebar = ({ ...props }) => {
    const { url } = usePage();

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" render={<Link href="/" />}>
                            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                                <Wind className="size-4" />
                            </div>
                            <span className="truncate font-semibold">AirCare</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>

                {navGroups.map((group) => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {group.items.map((item) =>
                                    item.children ? (
                                        // This item has children, so render a dropdown
                                        <Collapsible
                                            key={item.title}
                                            defaultOpen={item.children.some((child) => isActivePath(url, child.href))}
                                            render={<SidebarMenuItem />}
                                        >
                                            <CollapsibleTrigger
                                                render={<SidebarMenuButton tooltip={item.title} />}
                                                className="[&[data-panel-open]>svg:last-child]:rotate-90"
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                                <ChevronRight className="ml-auto transition-transform duration-200" />
                                            </CollapsibleTrigger>

                                            <CollapsibleContent
                                                className="h-[var(--collapsible-panel-height)] overflow-hidden transition-[height] duration-200 ease-out data-[starting-style]:h-0 data-[ending-style]:h-0"
                                            >
                                                <SidebarMenuSub>
                                                    {item.children.map((child) => (
                                                        <SidebarMenuSubItem key={child.title}>
                                                            <SidebarMenuSubButton
                                                                isActive={isActivePath(url, child.href)}
                                                                render={<Link href={child.href} />}
                                                            >
                                                                <child.icon />
                                                                <span>{child.title}</span>
                                                            </SidebarMenuSubButton>
                                                        </SidebarMenuSubItem>
                                                    ))}
                                                </SidebarMenuSub>
                                            </CollapsibleContent>
                                        </Collapsible>
                                    ) : (
                                        // No children, so render a normal link (your original code)
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton
                                                tooltip={item.title}
                                                isActive={isActivePath(url, item.href)}
                                                render={<Link href={item.href} />}
                                            >
                                                <item.icon />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ),
                                )}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Settings" render={<Link href="/settings" />}>
                            <Settings />
                            <span>Settings</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>

                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            tooltip="Logout"
                            onClick={() => router.delete('/logout', { preserveScroll: true })}
                        >
                            <LogOutIcon />
                            <span>Logout</span>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>

            <SidebarRail />
        </Sidebar>
    );
};

export default AppSidebar;

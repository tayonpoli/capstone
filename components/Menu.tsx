"use client"

// import { role } from "@/lib/data";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faHome,
    faChartSimple,
    faReceipt,
    faBoxOpen,
    faDolly,
    faUser,
    faGear,
    faRightFromBracket,
    faBoxesStacked,
    faSchool,
    faCoins,
    faSquarePollHorizontal,
    faBookBookmark,
    faStore,
    faCubes,
    faFileWaveform,
    faTags
    // Import other icons as needed
} from '@fortawesome/free-solid-svg-icons';

interface MenuItem {
    icon: IconDefinition;  // Changed from any to IconDefinition
    label: string;
    href: string;
    //   visible: string[];
}

interface MenuSection {
    title: string;
    items: MenuItem[];
}

const menuItems = [
    {
        title: "MENU",
        items: [
            {
                icon: faChartSimple,
                label: "Overview",
                href: "/",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: faTags,
                label: "Sales",
                href: "/sales",
                visible: ["admin", "teacher"],
            },
            {
                icon: faDolly,
                label: "Purchases",
                href: "/purchase",
                visible: ["admin", "teacher"],
            },
            {
                icon: faCoins,
                label: "Expenses",
                href: "/list/lessons",
                visible: ["admin", "teacher"],
            },
            {
                icon: faBoxOpen,
                label: "Inventory",
                href: "/product",
                visible: ["admin"],
            },
            {
                icon: faCubes,
                label: "Production",
                href: "/list/classes",
                visible: ["admin", "teacher"],
            },
            {
                icon: faSquarePollHorizontal,
                label: "Reports",
                href: "/list/exams",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: faBookBookmark,
                label: "Customers",
                href: "/customer",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: faStore,
                label: "Vendors",
                href: "/supplier",
                visible: ["admin", "teacher", "student", "parent"],
            },
            // {
            //     icon: faFileWaveform,
            //     label: "Chart of accounts",
            //     href: "/list/attendance",
            //     visible: ["admin", "teacher", "student", "parent"],
            // },
        ],
    },
    {
        title: "OTHER",
        items: [
            {
                icon: faUser,
                label: "Profile",
                href: "/profile",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: faGear,
                label: "Settings",
                href: "/settings",
                visible: ["admin", "teacher", "student", "parent"],
            },
            {
                icon: faRightFromBracket,
                label: "Logout",
                href: "/logout",
                visible: ["admin", "teacher", "student", "parent"],
            },
        ],
    },
];

const Menu = () => {
    const pathname = usePathname();

    const isActive = (href: string): boolean => {
        // For home page
        if (href === "/" && pathname === "/") {
            return true;
        }
        // For other pages, check if the current path starts with the href
        // This handles sub-routes like /list/teachers/123
        return href !== "/" && pathname.startsWith(href);
    };

    return (
        <div className="mt-4 text-sm">
            {menuItems.map((i) => (
                <div className="flex flex-col gap-2" key={i.title}>
                    <span className="hidden lg:block text-gray-400 font-light my-4">
                        {i.title}
                    </span>
                    {i.items.map((item) => {
                        // if (item.visible.includes(role)) {
                        const active = isActive(item.href);
                        return (
                            <Link
                                href={item.href}
                                key={item.label}
                                className={`
                    flex items-center justify-center lg:justify-start gap-4 
                    font-semibold text-gray-500 py-3 md:px-2 rounded-md transition-all
                    hover:text-darkSage 
                    ${active ? 'bg-darkSage/15 text-green' : ''}
                  `}
                            >
                                <FontAwesomeIcon
                                    icon={item.icon}
                                    className={`w-5 h-5 text-gray-500 ${active ? 'text-green' : ''}`}
                                />
                                <span className="hidden lg:block">{item.label}</span>
                            </Link>
                        );
                        // }
                    })}
                </div>
            ))}
        </div>
    );
};

export default Menu;

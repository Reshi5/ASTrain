import React, { useContext } from "react";
import classNames from "classnames";
import { AuthContext } from "../context/AuthContext";
import Link from "next/link";
import Image from "next/image";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PieChartIcon from "@mui/icons-material/PieChart";
import SettingsIcon from "@mui/icons-material/Settings";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";

import logo from "./../images/logo.png";
import { useRouter } from "next/router";

const navItems = [
  {
    label: "Dashboard",
    path: "dashboard",
    icon: <TrendingUpIcon />,
    allowedRoles: ["user", "admin"],
  },
  {
    label: "Inventory",
    path: "inventory",
    icon: <PieChartIcon />,
    allowedRoles: ["admin"],
  },
  {
    label: "Account",
    path: "account",
    icon: <ContactMailIcon />,
    allowedRoles: ["user", "admin"],
  },
  {
    label: "Settings",
    path: "settings",
    icon: <SettingsIcon />,
    allowedRoles: ["user", "admin"],
  },
  {
    label: "Users",
    path: "users",
    icon: <MeetingRoomIcon />,
    allowedRoles: ["admin"],
  },
];

interface NavItemProps {
  navItem: {
    path: string;
    icon: React.ReactNode;
    label: string;
  };
}

const NavItem: React.FC<NavItemProps> = ({ navItem }) => {
  const router = useRouter();
  const isCurrentRoute = router.pathname === `/${navItem.path}`;
  const classes = classNames({
    "px-2 sm:px-6 justify-center sm:justify-start py-3 rounded-full flex": true,
    "text-gray-600 hover:text-blue-500 transform hover:translate-x-1 transition ease-in-out duration-100":
      !isCurrentRoute,
    "bg-gradient text-gray-100 shadow-lg": isCurrentRoute,
  });
  return (
    <Link href={navItem.path} className={classes}>
      <a className="flex items-center">
        <div className="mr-0 sm:mr-4">{navItem.icon}</div>
        <span className="hidden sm:block">{navItem.label}</span>
      </a>
    </Link>
  );
};

interface NavItemContainerProps {}

const NavItemContainer: React.FC<NavItemContainerProps> = ({ children }) => (
  <div>{children}</div>
);

const Sidebar = () => {
  const auth = useContext(AuthContext);
  const { role } = auth.authState.userInfo;
  return (
    <section className="h-screen">
      <div className="w-16 sm:w-24 m-auto">
        <Image src={logo} alt="Logo" width={150} height={32} />
      </div>
      <div className="mt-20">
        {navItems.map((navItem, i) => (
          <NavItemContainer key={i}>
            {navItem.allowedRoles.includes(role) && (
              <NavItem navItem={navItem} />
            )}
          </NavItemContainer>
        ))}
      </div>
    </section>
  );
};

export default Sidebar;

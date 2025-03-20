// /components/Header/menuData.tsx
import { Menu } from "@/types/menu";

const menuData: Menu[] = [
  {
    id: 1,
    title: "Home",
    newTab: false,
    path: "/",
  },
  {
    id: 2,
    title: "Menu",
    newTab: false,
    submenu: [
      {
        id: 2.1,
        title: "About",
        newTab: false,
        path: "/about",
      },
      {
        id: 2.1,
        title: "Payment",
        newTab: false,
        path: "/payment",
      },
      // {
      //   id: 2.1,
      //   title: "Categories",
      //   newTab: false,
      //   path: "/category",
      // },
      // {
      //   id: 2.3,
      //   title: "About",
      //   newTab: false,
      //   path: "/about",
      // },
      {
        id: 2.6,
        title: "Subscribe To Newsletter",
        newTab: false,
        path: "/newsletter",
      },
      {
        id: 2.8,
        title: "Contact",
        newTab: false,
        path: "/contact",
      },
    ],
  },
  {
    id: 3,
    title: "Dashboard",
    newTab: false,
    submenu: [
      {
        id: 3.1,
        title: "Dashboard Home",
        newTab: false,
        path: "/dashboard",
      },
      // {
      //   id: 3.2,
      //   title: "Profile",
      //   newTab: false,
      //   path: "/dashboard/profile",
      // },
      {
        id: 3.3,
        title: "Create Listings",
        newTab: false,
        path: "/dashboard/create-listings",
      },
      {
        id: 3.3,
        title: "Create Video Answers",
        newTab: false,
        path: "/dashboard/create-listings/videos",
      },
      // {
      //   id: 3.3,
      //   title: "Create Guides",
      //   newTab: false,
      //   path: "/dashboard/guides/create",
      // },
      // {
      //   id: 3.3,
      //   title: "Edit Guides",
      //   newTab: false,
      //   path: "/dashboard/guides/edit",
      // },
      // {
      //   id: 3.4,
      //   title: "Favorites",
      //   newTab: false,
      //   path: "/dashboard/favorites",
      // },
      {
        id: 3.5,
        title: "Password Manager",
        newTab: false,
        path: "/dashboard/update-password",
      },
    ],
  },
];

export default menuData;

import { MegamenuItem, NavItemType } from "@/shared/Navigation/NavigationItem";
import ncNanoId from "@/utils/ncNanoId";
import { Route } from "@/routers/types";
import __megamenu from "./jsons/__megamenu.json";






const demoChildMenus: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Online booking",
  },
  {
    id: ncNanoId(),
    href: "/home-2",
    name: "Real estate",
    isNew: true,
  },
  {
    id: ncNanoId(),
    href: "/home-3",
    name: "Home 3",
    isNew: true,
  },
];

  const otherPageChildMenus: NavItemType[] = [
    { id: ncNanoId(), href: "/blog", name: "Blog page" },
    { id: ncNanoId(), href: "/blog/single" as Route, name: "Blog single" },
    { id: ncNanoId(), href: "/about", name: "About" },
    { id: ncNanoId(), href: "/contact", name: "Contact us" },
    
  ];


const templatesChildrenMenus: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/add-listing" as Route,
    name: "Add listing",
    type: "none",
  }
];

export const NAVIGATION_DEMO: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Home",
    type: "none",
    children: demoChildMenus,
    isNew: true,
  },
  {
    id: ncNanoId(),
    href: "/add-listing",
    name: "Listing Page",
    type: "none"
  },
  {
    id: ncNanoId(),
    href: "/author",
    name: "activity",
    type: "none",
    children: templatesChildrenMenus,
  },

  {
    id: ncNanoId(),
    href: "/blog",
    name: "blog",
    type: "none",
    children: otherPageChildMenus,
  },
];

export const NAVIGATION_DEMO_2: NavItemType[] = [
  {
    id: ncNanoId(),
    href: "/",
    name: "Home",
    type: "none",
  },
  {
    id: ncNanoId(),
    href: "/add-listing",
    name: "Listing pages",
    type: "none"
  },

  //
  {
    id: ncNanoId(),
    href: "/author",
    name: "Templates",
    type: "none",
    children: templatesChildrenMenus,
  },

  //
  {
    id: ncNanoId(),
    href: "/blog",
    name: "Others",
    type: "none",
    children: otherPageChildMenus,
  },
];
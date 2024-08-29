'use client'

import React, { Fragment, useEffect, useRef, useState } from 'react';
import Header from './Header';
import { usePathname } from 'next/navigation';
import MainNav2 from './MainNav2';





let OPTIONS = {
  root: null,
  rootMargin: "0px",
  threshold: 1.0,
};
let OBSERVER = null;
const PAGES_HIDE_HEADER_BORDER = [
  "/home-3",
  "/listing-car-detail",
  "/listing-experiences-detail",
  "/listing-stay-detail",
];

const SiteHeader = () => {
  const anchorRef = useRef(null);

  const [isTopOfPage, setIsTopOfPage] = useState(true);

  useEffect(() => {
    setIsTopOfPage(window.pageYOffset < 5);
  }, []);

  const pathname = usePathname();

  const intersectionCallback = (entries) => {
    entries.forEach((entry) => {
      setIsTopOfPage(entry.isIntersecting);
    });
  };

  useEffect(() => {
    if (!PAGES_HIDE_HEADER_BORDER.includes(pathname)) {
      OBSERVER && OBSERVER.disconnect();
      OBSERVER = null;
      return;
    }
    if (!OBSERVER) {
      OBSERVER = new IntersectionObserver(intersectionCallback, OPTIONS);
      anchorRef.current && OBSERVER.observe(anchorRef.current);
    }
  }, [pathname]);

  const renderHeader = () => {
   
    let headerClassName = "shadow-sm dark:border-b dark:border-neutral-700";
    if (PAGES_HIDE_HEADER_BORDER.includes(pathname)) {
      headerClassName = isTopOfPage
       ? ""
        : "shadow-sm dark:border-b dark:border-neutral-700";
    }
   
    return <Header className={headerClassName} navType="MainNav1" />;
  };

  return (
    <>
      {renderHeader()}
      <div ref={anchorRef} className="h-1 absolute invisible"></div>
    </>
  );
};

export default SiteHeader;
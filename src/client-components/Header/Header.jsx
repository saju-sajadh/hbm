

import React from "react";
import MainNav1 from "./MainNav1";
import MainNav2 from "./MainNav2";
import Header3 from "./Header3";


const Header = ({ navType = "MainNav1", className = "" }) => {
  const renderNav = () => {
    if (navType === "MainNav1") {
      return <MainNav1 />;
    } else if (navType === "MainNav2") {
      return <MainNav2 />;
    }else{
      return <Header3/>;
    }
  };

  return (
    <div
      className={`nc-Header sticky top-0 w-full left-0 right-0 z-40 nc-header-bg ${className}`}
    >
      {renderNav()}
    </div>
  );
};

export default Header;

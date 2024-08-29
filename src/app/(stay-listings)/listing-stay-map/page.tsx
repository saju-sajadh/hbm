import React, { FC } from "react";
import SectionGridHasMap2 from "../SectionGridHasMap2";

export interface ListingStayMapPageProps {}

const ListingStayMapPage: FC<ListingStayMapPageProps> = ({}) => {
  return (
    <div className="container pb-24 lg:pb-28 2xl:pl-10 xl:pr-0 xl:max-w-none">
      <SectionGridHasMap2/>
    </div>
  );
};

export default ListingStayMapPage;
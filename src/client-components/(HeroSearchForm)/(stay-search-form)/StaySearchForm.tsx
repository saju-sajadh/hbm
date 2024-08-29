

import React, { FC, useState } from "react";
import LocationInput from "../LocationInput";


const StaySearchForm: FC<{}> = ({}) => {
 
  
  const renderForm = () => {
    return (
      <div className="w-full relative mt-8 flex rounded-full shadow-xl dark:shadow-2xl bg-white dark:bg-neutral-800 ">
        <LocationInput className="flex-[1.5]" />
      </div>
    );
  };

  return renderForm();
};

export default StaySearchForm;

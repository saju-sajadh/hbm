"use client";

import { Popover, Transition } from "@headlessui/react";
import Input from "@/shared/Input";
import React, { FC, Fragment } from "react";
import { redirect, useRouter } from "next/navigation";


interface Props {
  className?: string;
}

const SearchDropdown: FC<Props> = ({ className = "" }) => {
  const inputRef = React.createRef<HTMLInputElement>();
  const router = useRouter()
  const search = async (data: FormData) => {
    const query = data.get('search')
    redirect(`/listing-stay-map?location=${query}`)
  }

  return (
    <React.Fragment>
      <Popover className={`relative ${className}`}>
        {({ open }) => {
          if (open) {
            setTimeout(() => {
              inputRef.current?.focus();
            }, 100);
          }

          return (
            <>
              <Popover.Button className="text-2xl md:text-[28px] w-12 h-12 rounded-full text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none flex items-center justify-center">
                <i className="las la-search"></i>
              </Popover.Button>

              <Transition
                show={open}
                as={Fragment}
                enter="transition ease-out duration-200"
                enterFrom="opacity-0 translate-y-1"
                enterTo="opacity-100 translate-y-0"
                leave="transition ease-in duration-150"
                leaveFrom="opacity-100 translate-y-0"
                leaveTo="opacity-0 translate-y-1"
              >
                <Popover.Panel
                  static
                  className="absolute right-0 z-10 top-full w-screen max-w-sm"
                >
                  <form action={search} method="POST">
                    <Input
                      ref={inputRef}
                      name="search"
                      rounded="rounded-full"
                      autoComplete="off"
                      type="search"
                      placeholder="Type and press enter"
                    />
                    <input type="submit" hidden value="" />
                  </form>
                </Popover.Panel>
              </Transition>
            </>
          );
        }}
      </Popover>
    </React.Fragment>
  );
};

export default SearchDropdown;

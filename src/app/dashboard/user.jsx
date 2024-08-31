import { Button } from '../../components/ui/button';

import Image from 'next/image';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import Link from 'next/link';
import { LogoutOutlined } from '@ant-design/icons';
import { SignOutButton } from '@clerk/nextjs';

export async function User() {
  

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="overflow-hidden rounded-full"
        >
          <Image
            src='/user.png'
            width={36}
            height={36}
            alt="Avatar"
            className="overflow-hidden rounded-full"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">  
          <DropdownMenuItem>

          <SignOutButton><Link href={'/'}>Sign out</Link></SignOutButton>
              </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
import { Button } from '@/components/ui/button';
import { EnableAccounts, suspendAccounts } from '@/actions/server';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  Table,
  TableCell
} from '@/components/ui/table';
import { getOwners } from '../../../../utils/db'
import { ChevronLeft, Trash2Icon } from 'lucide-react';
import { redirect } from 'next/dist/server/api-utils';
import { Add, Remove } from '@/components/remove'

export default async function CandidatePage() {
  
  let profilesPerPage = 5;
  const search = {role: 'customer'};
  const offset = 0;
  const { owners, newOffset, totalOwners }= await getOwners(search, Number(offset));
  async function prevPage() {
    'use server'
  }
  async function nextPage() {
    'use server'
    
  }

  async function suspendAccount(identifier){
    'use server'
    await suspendAccounts(identifier, '/dashboard/recruiters')
  }

  async function EnableAccount(identifier){
    'use server'
    await EnableAccounts(identifier, '/dashboard/recruiters')
  }

  return (
    <>
    <Card>
      <CardHeader>
        <CardTitle>Customers</CardTitle>
        <CardDescription>View all Customers.</CardDescription>
      </CardHeader>
      <CardContent>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="flex overflow-x-auto">
        <div className='min-w-full'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Remove</TableHead>
              <TableHead>
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {owners.map((profile) => (
              <TableRow key={profile?.userid}>
                <TableCell>{profile?.name}</TableCell>
                <TableCell>{profile?.email ? profile?.email : profile?.userid}</TableCell>
                <TableCell>
                      {profile?.active === true ? (
                        <Remove
                          suspendAccount={suspendAccount}
                          id={profile?.userid}
                        />
                      ) : (
                        <Add
                          EnableAccount={EnableAccount}
                          id={profile?.userid}
                        />
                      )}
                    </TableCell>
                <TableCell>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
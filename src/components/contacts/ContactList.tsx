
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Building2, MoreVertical, Plus, Search, User, Phone, Mail, FileText } from "lucide-react";
import { toast } from "sonner";

type ContactType = 'customer' | 'supplier' | 'borrower';

interface Contact {
  id: string;
  name: string;
  type: ContactType;
  email: string;
  phone: string;
  contactPerson: string;
  balance: number;
}

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    type: 'customer',
    email: 'info@acme.com',
    phone: '(555) 123-4567',
    contactPerson: 'John Smith',
    balance: 1250.50
  },
  {
    id: '2',
    name: 'Global Supplies Inc',
    type: 'supplier',
    email: 'orders@globalsupplies.com',
    phone: '(555) 987-6543',
    contactPerson: 'Maria Garcia',
    balance: -450.75
  },
  {
    id: '3',
    name: 'Tech Solutions Ltd',
    type: 'customer',
    email: 'hello@techsolutions.com',
    phone: '(555) 234-5678',
    contactPerson: 'David Chen',
    balance: 2450.50
  },
  {
    id: '4',
    name: 'National Bank',
    type: 'borrower',
    email: 'support@nationalbank.com',
    phone: '(555) 876-5432',
    contactPerson: 'Sarah Johnson',
    balance: -5000.00
  },
  {
    id: '5',
    name: 'Smiths Manufacturing',
    type: 'customer',
    email: 'orders@smithsmfg.com',
    phone: '(555) 345-6789',
    contactPerson: 'Robert Williams',
    balance: 780.25
  }
];

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>(mockContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ContactType | 'all'>('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || contact.type === activeTab;
    
    return matchesSearch && matchesTab;
  });

  const handleViewDetails = (id: string) => {
    toast.info(`Viewing details for contact ${id}`);
  };

  const handleEdit = (id: string) => {
    toast.info(`Editing contact ${id}`);
  };

  const handleDelete = (id: string) => {
    toast.success(`Contact ${id} deleted`);
    setContacts(contacts.filter(contact => contact.id !== id));
  };

  const handleAddContact = () => {
    toast.success("Contact added successfully!");
    setIsAddDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search contacts..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Contact
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Contact</DialogTitle>
              <DialogDescription>
                Add a new customer, supplier, or borrower to your contacts.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="name" className="text-right">
                  Name
                </label>
                <Input id="name" placeholder="Company name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="type" className="text-right">
                  Type
                </label>
                <select id="type" className="col-span-3 border p-2 rounded-md">
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="borrower">Borrower</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contact-person" className="text-right">
                  Contact Person
                </label>
                <Input id="contact-person" placeholder="Full name" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <Input id="email" type="email" placeholder="Email address" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right">
                  Phone
                </label>
                <Input id="phone" placeholder="Phone number" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddContact}>Add Contact</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as ContactType | 'all')}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
          <TabsTrigger value="supplier">Suppliers</TabsTrigger>
          <TabsTrigger value="borrower">Borrowers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-0">
          <GlassCard className="p-0 overflow-hidden">
            <div className="grid grid-cols-1 divide-y">
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => (
                  <div key={contact.id} className="p-4 flex items-center">
                    <div className="h-10 w-10 rounded-full flex items-center justify-center bg-secondary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="font-medium">{contact.name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <User className="h-3.5 w-3.5 mr-1" />
                            <span>{contact.contactPerson}</span>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end mt-2 sm:mt-0">
                          <span className={`font-medium ${contact.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                            {contact.balance >= 0 ? '+' : ''}${contact.balance.toFixed(2)}
                          </span>
                          <span className="text-xs capitalize text-muted-foreground">
                            {contact.type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm text-muted-foreground">
                        <div className="flex items-center">
                          <Mail className="h-3.5 w-3.5 mr-1" />
                          <span>{contact.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-3.5 w-3.5 mr-1" />
                          <span>{contact.phone}</span>
                        </div>
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleViewDetails(contact.id)}>
                          <FileText className="h-4 w-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(contact.id)}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive focus:text-destructive" 
                          onClick={() => handleDelete(contact.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <p className="text-muted-foreground">No contacts found</p>
                </div>
              )}
            </div>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="customer" className="mt-0">
          {/* Same structure as "all" but filtered for customers only */}
        </TabsContent>
        
        <TabsContent value="supplier" className="mt-0">
          {/* Same structure as "all" but filtered for suppliers only */}
        </TabsContent>
        
        <TabsContent value="borrower" className="mt-0">
          {/* Same structure as "all" but filtered for borrowers only */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

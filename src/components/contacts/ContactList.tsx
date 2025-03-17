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
import { Building2, MoreVertical, Plus, Search, User, Phone, Mail, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { contactsApi, Contact } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type ContactType = 'customer' | 'supplier' | 'borrower';

interface NewContact {
  name: string;
  type: ContactType;
  email: string;
  phone: string;
  contactPerson: string;
}

interface ContactListProps {
  filterType?: string;
}

export function ContactList({ filterType = '' }: ContactListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ContactType | 'all'>(filterType as ContactType | 'all' || 'all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newContact, setNewContact] = useState<NewContact>({
    name: '',
    type: 'customer',
    email: '',
    phone: '',
    contactPerson: '',
  });
  
  const queryClient = useQueryClient();
  
  // Fetch contacts from API
  const { data: contacts = [], isLoading, isError } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getContacts
  });

  // Add contact mutation
  const addContactMutation = useMutation({
    mutationFn: contactsApi.createContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success("Contact added successfully!");
      setIsAddDialogOpen(false);
      resetNewContactForm();
    },
    onError: (error) => {
      toast.error(`Error adding contact: ${error.message}`);
    }
  });

  // Delete contact mutation
  const deleteContactMutation = useMutation({
    mutationFn: contactsApi.deleteContact,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      toast.success("Contact deleted successfully!");
    },
    onError: (error) => {
      toast.error(`Error deleting contact: ${error.message}`);
    }
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = 
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || contact.type === activeTab;
    
    const matchesExternalFilter = !filterType || contact.type === filterType;
    
    return matchesSearch && matchesTab && matchesExternalFilter;
  });

  const handleViewDetails = (id: string | number) => {
    toast.info(`Viewing details for contact ${id}`);
  };

  const handleEdit = (id: string | number) => {
    toast.info(`Editing contact ${id}`);
  };

  const handleDelete = (id: string | number) => {
    deleteContactMutation.mutate(id.toString());
  };

  const handleAddContact = () => {
    addContactMutation.mutate(newContact);
  };
  
  const resetNewContactForm = () => {
    setNewContact({
      name: '',
      type: 'customer',
      email: '',
      phone: '',
      contactPerson: '',
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setNewContact(prev => ({
      ...prev,
      [id === 'contact-person' ? 'contactPerson' : id]: value
    }));
  };

  if (isError) {
    return (
      <GlassCard>
        <div className="p-8 text-center">
          <p className="text-destructive">Error loading contacts. Please try again later.</p>
        </div>
      </GlassCard>
    );
  }

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
                <Input 
                  id="name" 
                  placeholder="Company name" 
                  className="col-span-3" 
                  value={newContact.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="type" className="text-right">
                  Type
                </label>
                <select 
                  id="type" 
                  className="col-span-3 border p-2 rounded-md"
                  value={newContact.type}
                  onChange={handleInputChange}
                >
                  <option value="customer">Customer</option>
                  <option value="supplier">Supplier</option>
                  <option value="borrower">Borrower</option>
                </select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="contact-person" className="text-right">
                  Contact Person
                </label>
                <Input 
                  id="contact-person" 
                  placeholder="Full name" 
                  className="col-span-3" 
                  value={newContact.contactPerson}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="email" className="text-right">
                  Email
                </label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Email address" 
                  className="col-span-3" 
                  value={newContact.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="phone" className="text-right">
                  Phone
                </label>
                <Input 
                  id="phone" 
                  placeholder="Phone number" 
                  className="col-span-3" 
                  value={newContact.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleAddContact}
                disabled={addContactMutation.isPending}
              >
                {addContactMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : 'Add Contact'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {!filterType && (
        <Tabs defaultValue="all" onValueChange={(value) => setActiveTab(value as ContactType | 'all')}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="customer">Customers</TabsTrigger>
            <TabsTrigger value="supplier">Suppliers</TabsTrigger>
            <TabsTrigger value="borrower">Borrowers</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-0">
            <ContactListContent
              contacts={filteredContacts}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteContactMutation={deleteContactMutation}
            />
          </TabsContent>
          
          <TabsContent value="customer" className="mt-0">
            <ContactListContent
              contacts={filteredContacts}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteContactMutation={deleteContactMutation}
            />
          </TabsContent>
          
          <TabsContent value="supplier" className="mt-0">
            <ContactListContent
              contacts={filteredContacts}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteContactMutation={deleteContactMutation}
            />
          </TabsContent>
          
          <TabsContent value="borrower" className="mt-0">
            <ContactListContent
              contacts={filteredContacts}
              isLoading={isLoading}
              onViewDetails={handleViewDetails}
              onEdit={handleEdit}
              onDelete={handleDelete}
              deleteContactMutation={deleteContactMutation}
            />
          </TabsContent>
        </Tabs>
      )}
      
      {filterType && (
        <ContactListContent
          contacts={filteredContacts}
          isLoading={isLoading}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
          deleteContactMutation={deleteContactMutation}
        />
      )}
    </div>
  );
}

interface ContactListContentProps {
  contacts: Contact[];
  isLoading: boolean;
  onViewDetails: (id: string | number) => void;
  onEdit: (id: string | number) => void;
  onDelete: (id: string | number) => void;
  deleteContactMutation: any;
}

function ContactListContent({
  contacts,
  isLoading,
  onViewDetails,
  onEdit,
  onDelete,
  deleteContactMutation
}: ContactListContentProps) {
  return (
    <GlassCard className="p-0 overflow-hidden">
      {isLoading ? (
        <div className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading contacts...</p>
        </div>
      ) : contacts.length > 0 ? (
        <div className="grid grid-cols-1 divide-y">
          {contacts.map((contact: Contact) => (
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
                  <DropdownMenuItem onClick={() => onViewDetails(contact.id)}>
                    <FileText className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(contact.id)}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive focus:text-destructive" 
                    onClick={() => onDelete(contact.id)}
                    disabled={deleteContactMutation.isPending}
                  >
                    {deleteContactMutation.isPending && contact.id === deleteContactMutation.variables ? 
                      'Deleting...' : 'Delete'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center">
          <p className="text-muted-foreground">No contacts found</p>
        </div>
      )}
    </GlassCard>
  );
}

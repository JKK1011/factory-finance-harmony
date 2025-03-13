
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { ContactList } from "@/components/contacts/ContactList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Contacts = () => {
  const [activeTab, setActiveTab] = useState<string>("all");

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Manage your customers, suppliers, and borrowers
        </p>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Contacts</TabsTrigger>
          <TabsTrigger value="customer">Customers</TabsTrigger>
          <TabsTrigger value="supplier">Suppliers</TabsTrigger>
          <TabsTrigger value="borrower">Borrowers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <ContactList filterType="" />
        </TabsContent>
        
        <TabsContent value="customer">
          <ContactList filterType="customer" />
        </TabsContent>
        
        <TabsContent value="supplier">
          <ContactList filterType="supplier" />
        </TabsContent>
        
        <TabsContent value="borrower">
          <ContactList filterType="borrower" />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Contacts;

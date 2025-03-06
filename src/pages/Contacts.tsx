
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { ContactList } from "@/components/contacts/ContactList";

const Contacts = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Contacts</h1>
        <p className="text-muted-foreground">
          Manage your customers, suppliers, and borrowers
        </p>
      </div>
      
      <ContactList />
    </Layout>
  );
};

export default Contacts;

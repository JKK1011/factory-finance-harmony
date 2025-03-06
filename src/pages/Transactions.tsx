
import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { TransactionForm } from "@/components/transactions/TransactionForm";
import { TransactionList } from "@/components/transactions/TransactionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Transactions = () => {
  const [activeTab, setActiveTab] = useState<string>("list");

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Record and manage financial transactions
        </p>
      </div>
      
      <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="list">Transaction List</TabsTrigger>
          <TabsTrigger value="add">Add Transaction</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list">
          <TransactionList onAddNew={() => setActiveTab("add")} />
        </TabsContent>
        
        <TabsContent value="add">
          <TransactionForm onSuccess={() => setActiveTab("list")} />
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Transactions;

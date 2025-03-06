
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { TransactionForm } from "@/components/transactions/TransactionForm";

const Transactions = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          Record and manage financial transactions
        </p>
      </div>
      
      <TransactionForm />
    </Layout>
  );
};

export default Transactions;

"use client";
import React, { useState, useEffect } from "react";
import Dashboard from "@/components/Dashboard";
import SearchForm from "@/components/SearchForm";
import CertificateForm from "@/components/CertificateForm";
import { Chain } from "@/blockchain/blockchain";
const Page = () => {
  const [chain, setChain] = useState(Chain.instance.chain);

  useEffect(() => {
    setChain(Chain.instance.chain);
  }, [Chain.instance.chain.length]);

  return (
    <div>
      <CertificateForm onUpdate={() => setChain([...Chain.instance.chain])} />
      <SearchForm chain={chain} />
      <Dashboard chain={chain} />
    </div>
  );
};

export default Page;

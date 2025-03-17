import { useCallback, useEffect, useState } from "react";

import { Transaction } from "@/types/finance";
import { fetchTransactions } from "@/api/finance";


export function useTransactions(page: number, pageSize: number) {
  const [loadingTransactions, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchTransactionsCallback = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchTransactions(page, pageSize);
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);
  

  useEffect(() => {
    fetchTransactionsCallback();
  }, [fetchTransactionsCallback]);

  return { transactions, setTransactions, loadingTransactions, refetchTransactions: fetchTransactionsCallback };
}
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Item, PaymentInfo } from "@/types/summary";
import { STORAGE_KEY, DIVIDER_KEY, PAYMENT_KEY } from "@/constants/summary";

export const useSummaryData = () => {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [persons, setPersons] = useState<string[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({ type: "none" });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const itemsParam = searchParams.get("items");
        const personsParam = searchParams.get("persons");
        let initialItems: Item[] = [];
        let initialPersons: string[] = [];

        if (itemsParam && personsParam) {
          try {
            initialItems = JSON.parse(atob(itemsParam));
            initialPersons = JSON.parse(atob(personsParam));
          } catch (e) {
            console.error(
              "Failed to parse data from URL, falling back to localStorage.",
              e
            );
          }
        }

        if (initialItems.length === 0 && initialPersons.length === 0) {
          const itemsRaw = STORAGE_KEY
            ? localStorage.getItem(STORAGE_KEY)
            : null;
          const dividerRaw = DIVIDER_KEY
            ? localStorage.getItem(DIVIDER_KEY)
            : null;

          if (itemsRaw) {
            initialItems = JSON.parse(itemsRaw).map((item: Item) => ({
              ...item,
              includeVat: item.includeVat ?? false,
            }));
          }
          if (dividerRaw) initialPersons = JSON.parse(dividerRaw);
        }

        // Load payment info from localStorage
        const savedPaymentInfo = localStorage.getItem(PAYMENT_KEY);
        if (savedPaymentInfo) {
          try {
            setPaymentInfo(JSON.parse(savedPaymentInfo));
          } catch (e) {
            console.error("Failed to parse payment info", e);
          }
        }

        setItems(initialItems);
        setPersons(initialPersons);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [searchParams]);

  const savePaymentInfo = useCallback((info: PaymentInfo) => {
    setPaymentInfo(info);
    localStorage.setItem(PAYMENT_KEY, JSON.stringify(info));
  }, []);

  return {
    items,
    persons,
    paymentInfo,
    isLoading,
    savePaymentInfo,
  };
};

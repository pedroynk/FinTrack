import { useState, useEffect, useCallback } from 'react';

import { Class } from '@/types/finance';
import { supabase } from '@/lib/supabase';

export function useClasses() {
  const [classes, setClasses] = useState<Class[]>([]);
  
  const fetchClasses = useCallback(async () => {
    const { data, error } = await supabase
      .from("class")
      .select("*")
      .order("name", { ascending: true });
    if (error) {
      console.error("Error fetching classes:", error);
    } else {
      setClasses(data || []);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return { classes, refetchClasses: fetchClasses };
}

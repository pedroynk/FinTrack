import { useState, useEffect } from "react";
import { Nature, Type } from "@/types/finance";

import TypeManager from "./components/TypeManager";
import { fetchNatures, fetchTypes } from "@/api/finance";
import ClassManager from "../home/components/ClassManager";


export default function Dimensions() {
  const [natures, setNatures] = useState<Nature[]>([]);
  const [types, setTypes] = useState<Type[]>([]);

  function refreshNatures() {
    fetchNatures().then(setNatures);
  }

  function refreshTypes() {
    fetchTypes().then(setTypes)
  }

  useEffect(() => {
    refreshNatures();
    refreshTypes();
  }, []);



  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      <TypeManager natures={natures} types={types} refetchTypes={refreshTypes}/>
      <ClassManager types={types}/>

    </div>
  );
}

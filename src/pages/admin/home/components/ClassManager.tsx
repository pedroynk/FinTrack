import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectItem } from "@/components/ui/select";
import { Trash, Pen } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { fetchClasses, deleteClassApi, createClassApi, updateClassApi } from "@/api/finance";
import { Class, ClassCreateRequest, ClassUpdateRequest, Type } from "@/types/finance";

function ClassManager({ types }: { types: Type[] }) {
  const [newClass, setNewClass] = useState<ClassCreateRequest>({
    name: "",
    type_id: 0,
  });
  const [classes, setClasses] = useState<Class[]>([]);
  const [editingClass, setEditingClass] = useState<ClassUpdateRequest | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forDeletionClass, setForDeletionClass] = useState<number | null>(null);

  useEffect(() => {
    fetchClasses().then(setClasses);
  }, []);

  function handleDelete(id: number) {
    setForDeletionClass(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (forDeletionClass) {
      await deleteClassApi(forDeletionClass);
      fetchClasses().then(setClasses);
      setConfirmOpen(false);
      setForDeletionClass(null);
    }
  }

  function cancelDelete() {
    setConfirmOpen(false);
    setForDeletionClass(null);
  }

  async function handleCreate() {
    console.log(newClass);
    await createClassApi(newClass);
    fetchClasses().then(setClasses);
    setNewClass({ name: "", type_id: 0 });
  }

  async function handleUpdate() {
    if (editingClass && editingClass.id != null) {
      await updateClassApi(editingClass);
      fetchClasses().then(setClasses);
      setEditingClass(null);
    }
  }

  function startEditing(cls: Class) {
    setEditingClass({ id: cls.id, name: cls.name, type_id: cls.type.id });
  }  

  function cancelEditing() {
    setEditingClass(null);
  }

  return (
    <Card className="max-h-[800px]">
      <CardHeader>
        <CardTitle>Gerenciamento de Classes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-row flex-wrap items-center gap-4">
          <Input
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
            placeholder="Nome da Classe"
            className="w-[60%]"
          />
          <Select
            value={String(newClass.type_id) || "Selecione"}
            onValueChange={(value) => setNewClass({ ...newClass, type_id: parseInt(value) })}
          >
            <SelectTrigger>
              {newClass.type_id ? types.find((t) => t.id == newClass.type_id)?.name : "Tipo"}
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.id} value={String(type.id)}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleCreate}>Criar Classe</Button>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-4"></div>

        <div className="mt-4 max-h-[460px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell>Nome</TableCell>
                <TableCell>Tipo</TableCell>
                <TableCell>Ações</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell>
                    {editingClass && editingClass.id === cls.id ? (
                      <Input
                        value={editingClass.name}
                        onChange={(e) =>
                          setEditingClass({ ...editingClass, name: e.target.value })
                        }
                      />
                    ) : (
                      cls.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingClass && editingClass.id === cls.id ? (
                      <Select
                        value={String(editingClass.type_id) || ""}
                        onValueChange={(value) =>
                          setEditingClass({ ...editingClass, type_id: parseInt(value) })
                        }
                      >
                        <SelectTrigger>
                          {types.find((t) => t.id === editingClass.type_id)?.name || "Selecione o Tipo"}
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((type) => (
                            <SelectItem key={type.id} value={String(type.id)}>
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      cls.type?.name
                    )}
                  </TableCell>
                  <TableCell className="flex space-x-2">
                    {editingClass && editingClass.id === cls.id ? (
                      <>
                        <Button onClick={handleUpdate} className="p-2 text-green-500" variant="ghost">
                          Salvar
                        </Button>
                        <Button onClick={cancelEditing} className="p-2 text-gray-500" variant="ghost">
                          Cancelar
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" className="p-2 text-blue-500" onClick={() => startEditing(cls)}>
                          <Pen size={16} />
                        </Button>
                        <Button variant="ghost" className="p-2 text-red-500" onClick={() => handleDelete(cls.id)}>
                          <Trash size={16} />
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogTitle>Confirmar Exclusão</DialogTitle>
          <p>Tem certeza que deseja excluir esta classe? Essa ação não pode ser desfeita.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={cancelDelete}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

export default ClassManager;

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectItem,
} from "@/components/ui/select";
import { HexColorPicker } from "react-colorful";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { Trash, Pen } from "lucide-react";
import {
  deleteTypeApi,
  createTypeApi,
  updateTypeApi,
} from "@/api/finance";
import { Type, Nature, TypeCreateRequest, TypeUpdateRequest } from "@/types/finance";

const ICON_OPTIONS = [
  "wrench","utensils","activity","briefcase","dollar-sign","credit-card",
  "shopping-bag","shopping-cart","heart","coffee","home","car","book","plane",
  "gift","music","film","calendar","clock","globe","map-pin","umbrella","truck",
  "bell","bar-chart-2","award","ticket","tv","cpu","dribbble"
];

function TypeManager({
  natures,
  types,
  refetchTypes,
}: { natures: Nature[]; types: Type[]; refetchTypes: () => void }) {
  const [newType, setNewType] = useState<TypeCreateRequest>({
    name: "",
    hex_color: null,
    lucide_icon: null,
    nature_id: 0,
  });
  const [showNewColorPicker, setShowNewColorPicker] = useState(false);

  const [showEditColorPicker, setShowEditColorPicker] = useState(false);
  const [editingType, setEditingType] = useState<TypeUpdateRequest | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [forDeletionType, setForDeletionType] = useState<number | null>(null);

  async function handleDelete(id: number) {
    setForDeletionType(id);
    setConfirmOpen(true);
  }

  async function confirmDelete() {
    if (forDeletionType) {
      await deleteTypeApi(forDeletionType);
      refetchTypes();
      setConfirmOpen(false);
      setForDeletionType(null);
    }
  }

  async function handleCreate() {
    await createTypeApi(newType);
    refetchTypes();
    setNewType({ name: "", hex_color: null, lucide_icon: null, nature_id: 0 });
    setShowNewColorPicker(false);
  }

  async function handleUpdate() {
    if (editingType && editingType.id != null) {
      await updateTypeApi(editingType);
      refetchTypes();
      setEditingType(null);
      setShowEditColorPicker(false);
    }
  }

  function startEditing(type: Type) {
    setEditingType({
      id: type.id,
      name: type.name,
      hex_color: type.hex_color,
      lucide_icon: type.lucide_icon,
      nature_id: type.nature.id,
    });
    setShowEditColorPicker(false);
  }

  function cancelEditing() {
    setEditingType(null);
    setShowEditColorPicker(false);
  }

  return (
    <Card className="max-h-auto md:h-[800px]">
      <CardHeader>
        <CardTitle>Gerenciamento de Tipos</CardTitle>
      </CardHeader>

      <CardContent>
        {/* New Type Form */}
        <div className="flex flex-col md:flex-row flex-wrap items-center gap-4">
          <Input
            value={newType.name || ""}
            onChange={(e) => setNewType({ ...newType, name: e.target.value })}
            placeholder="Tipo"
            className="w-full md:w-[60%]"
          />

          {/* Botão de cor com texto REALMENTE centralizado */}
          <Button
            type="button"
            onClick={() => setShowNewColorPicker(!showNewColorPicker)}
            className="
              relative justify-center
              w-full md:w-auto
              h-9 md:h-10
              px-8 md:px-10
              text-[clamp(0.75rem,2.6vw,0.875rem)]
              leading-none
            "
          >
            {/* swatch não desloca o centro do texto */}
            <span
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full ring-1 ring-black/20"
              style={{ backgroundColor: newType.hex_color ?? "#f59e0b" }}
              aria-hidden
            />
            <span>{newType.hex_color ? "Alterar Cor" : "Escolher Cor"}</span>
          </Button>

          {showNewColorPicker && (
            <div className="mt-2 max-w-xs w-full sm:w-auto">
              <HexColorPicker
                color={newType.hex_color || "#000000"}
                onChange={(color) => setNewType({ ...newType, hex_color: color })}
              />
              <Input
                value={newType.hex_color || "#000000"}
                onChange={(e) =>
                  setNewType({ ...newType, hex_color: e.target.value })
                }
                placeholder="Type hex code"
                className="mt-2"
              />
            </div>
          )}

          <Select
            value={String(newType.nature_id) || "Selecione"}
            onValueChange={(value) =>
              setNewType({ ...newType, nature_id: parseInt(value) })
            }
          >
            <SelectTrigger className="w-full md:w-auto">
              {newType.nature_id
                ? natures.find((n) => n.id == newType.nature_id)?.name
                : "Natureza"}
            </SelectTrigger>
            <SelectContent>
              {natures.map((nature) => (
                <SelectItem key={nature.id} value={String(nature.id)}>
                  {nature.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={newType.lucide_icon || ""}
            onValueChange={(value) =>
              setNewType({ ...newType, lucide_icon: value || null })
            }
          >
            <SelectTrigger className="w-full md:w-auto flex items-center">
              {newType.lucide_icon ? (
                <>
                  <DynamicIcon
                    name={newType.lucide_icon as IconName}
                    size={16}
                    className="mr-2"
                  />
                  <span>{newType.lucide_icon}</span>
                </>
              ) : (
                <span>Ícone</span>
              )}
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="null">
                <span>Nenhum</span>
              </SelectItem>
              {ICON_OPTIONS.map((icon) => (
                <SelectItem key={icon} value={icon || "null"}>
                  <div className="flex items-center">
                    <DynamicIcon name={icon as IconName} size={16} className="mr-2" />
                    <span>{icon}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            onClick={handleCreate}
            className="w-full md:w-auto h-9 md:h-10 px-3 md:px-4 text-[clamp(0.75rem,2.6vw,0.875rem)] leading-none"
          >
            Criar Tipo
          </Button>
        </div>

        {/* Divider between form and table */}
        <div className="mt-8 border-t border-gray-200 pt-4"></div>

        {/* Types Table */}
        <div className="mt-4 w-full overflow-x-auto">
          <div className="max-h-auto md:h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Cor</TableCell>
                  <TableCell>Ícone</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell>Natureza</TableCell>
                  <TableCell>Ações</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {types.map((type) => (
                  <TableRow key={type.id}>
                    <TableCell>
                      {editingType && editingType.id === type.id ? (
                        <div className="flex items-center gap-2">
                          <div
                            style={{
                              backgroundColor: editingType.hex_color || "transparent",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              border: "1px solid #ccc",
                            }}
                          />
                          {/* Botão de alterar cor (compacto) */}
                          <Button
                            onClick={() => setShowEditColorPicker(!showEditColorPicker)}
                            variant="ghost"
                            className="h-8 px-2 text-xs"
                          >
                            {editingType.hex_color ? "Alterar Cor" : "Escolher Cor"}
                          </Button>
                        </div>
                      ) : (
                        <div
                          style={{
                            backgroundColor: type.hex_color || "transparent",
                            width: "20px",
                            height: "20px",
                            borderRadius: "50%",
                            border: "1px solid #ccc",
                          }}
                        />
                      )}

                      {editingType && editingType.id === type.id && showEditColorPicker && (
                        <div className="mt-2 max-w-xs">
                          <HexColorPicker
                            color={editingType.hex_color || "#000000"}
                            onChange={(color) =>
                              setEditingType({ ...editingType, hex_color: color })
                            }
                          />
                          <Input
                            value={editingType.hex_color || "#000000"}
                            onChange={(e) =>
                              setEditingType({ ...editingType, hex_color: e.target.value })
                            }
                            placeholder="Type hex code"
                            className="mt-2"
                          />
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                      {editingType && editingType.id === type.id ? (
                        <Select
                          value={editingType.lucide_icon || ""}
                          onValueChange={(value) =>
                            setEditingType({ ...editingType, lucide_icon: value || null })
                          }
                        >
                          <SelectTrigger className="flex items-center w-full md:w-auto">
                            {editingType.lucide_icon ? (
                              <>
                                <DynamicIcon
                                  name={editingType.lucide_icon as IconName}
                                  size={16}
                                  className="mr-2"
                                />
                                <span>{editingType.lucide_icon}</span>
                              </>
                            ) : (
                              <span>Select Icon</span>
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="null">
                              <span>Nenhum</span>
                            </SelectItem>
                            {ICON_OPTIONS.map((icon) => (
                              <SelectItem key={icon} value={icon}>
                                {icon}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : editingType?.id !== type.id && type.lucide_icon ? (
                        <DynamicIcon name={type.lucide_icon as IconName} size={16} />
                      ) : (
                        <span>None</span>
                      )}
                    </TableCell>

                    <TableCell>
                      {editingType && editingType.id === type.id ? (
                        <Input
                          value={editingType.name || ""}
                          onChange={(e) =>
                            setEditingType({ ...editingType, name: e.target.value })
                          }
                          className="w-full"
                        />
                      ) : (
                        type.name
                      )}
                    </TableCell>

                    <TableCell>
                      {editingType && editingType.id === type.id ? (
                        <Select
                          value={String(editingType.nature_id) || ""}
                          onValueChange={(value) =>
                            setEditingType({ ...editingType, nature_id: parseInt(value) })
                          }
                        >
                          <SelectTrigger className="w-full md:w-auto">
                            {editingType.nature_id
                              ? natures.find((n) => n.id == editingType.nature_id)?.name
                              : "Select Nature"}
                          </SelectTrigger>
                          <SelectContent>
                            {natures.map((nature) => (
                              <SelectItem key={nature.id} value={String(nature.id)}>
                                {nature.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        type.nature?.name ||
                        natures.find((n) => n.id === type.nature?.id)?.name
                      )}
                    </TableCell>

                    <TableCell className="flex gap-1">
                      {editingType && editingType.id === type.id ? (
                        <>
                          <Button
                            onClick={handleUpdate}
                            className="p-2 text-green-500 h-8 text-xs"
                            variant="ghost"
                          >
                            Save
                          </Button>
                          <Button
                            onClick={cancelEditing}
                            className="p-2 text-gray-500 h-8 text-xs"
                            variant="ghost"
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            variant="ghost"
                            className="p-2 text-blue-500 h-8"
                            onClick={() => startEditing(type)}
                          >
                            <Pen size={16} />
                          </Button>

                          <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={confirmDelete}>
                                  Continuar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                className="p-2 text-red-500 h-8"
                                onClick={() => handleDelete(type.id)}
                              >
                                <Trash size={16} />
                              </Button>
                            </AlertDialogTrigger>
                          </AlertDialog>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TypeManager;

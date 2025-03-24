import { Dimension, RecurringCreateRequest } from "@/types/recurring";
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/DatePicker";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface RecurringFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  newRecurring: RecurringCreateRequest;
  setNewRecurring: (recurring: RecurringCreateRequest) => void;
  createRecurring: () => void;
  isEditing: boolean;
  onClose: () => void;
  dimensions: Dimension[];
}

export function RecurringFormDialog({
  open,
  setOpen,
  newRecurring,
  setNewRecurring,
  createRecurring,
  isEditing,
  onClose,
  dimensions,
}: RecurringFormDialogProps) {
  const [formError, setFormError] = useState<string>("");

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedNature, setSelectedNature] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing && newRecurring.class_id && dimensions.length > 0) {
      for (const nature of dimensions) {
        for (const type of nature.types) {
          const found = type.classes.find((c) => c.id === newRecurring.class_id);
          if (found) {
            console.log("ENCONTROU!", { natureId: nature.id, typeId: type.id });
            setSelectedNature(nature.id);
            setSelectedType(type.id);
            return;
          }
        }
      }
    }
  }, [isEditing, newRecurring.class_id, dimensions]);



  const selectedNatureObj = dimensions.find((n) => n.id === selectedNature);
  const types = selectedNatureObj ? selectedNatureObj.types : [];
  const selectedTypeObj = types.find((t) => t.id === selectedType);
  const classes = selectedTypeObj ? selectedTypeObj.classes : [];

  const handleCreate = () => {
    if (!selectedNature) return setFormError("Selecione a Natureza.");
    if (!selectedType) return setFormError("Selecione o Tipo.");
    if (!newRecurring.class_id) return setFormError("Selecione a Classe.");
    if (!newRecurring.value || newRecurring.value <= 0) return setFormError("Informe um Valor válido.");
    if (!newRecurring.frequency) return setFormError("Selecione a Frequência.")

    setFormError("");
    createRecurring();
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      <Dialog
        open={open}
        onOpenChange={(openVal) => {
          setOpen(openVal);
          if (!openVal) {
            setSelectedNature(null);
            setSelectedType(null);
            setFormError("");
            onClose();
          }
        }}
      >
        {!isEditing && (
          <DialogTrigger asChild>
            <Button>Adicionar Recorrência</Button>
          </DialogTrigger>
        )}
        <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Editar Recorrência" : "Nova Recorrência"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4">
          <Label>
            Natureza <span className="text-red-500">*</span>
          </Label>
          <Select
            value={String(selectedNature)}
            onValueChange={(value) => {
              setSelectedNature(parseInt(value));
              setSelectedType(null);
              setNewRecurring({ ...newRecurring, class_id: 0 });
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione a Natureza" />
            </SelectTrigger>
            <SelectContent>
              {dimensions.map((nature) => (
                <SelectItem key={nature.id} value={String(nature.id)}>
                  {nature.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Type Select */}
          {selectedNature && (
            <>
              <Label>
                Tipo <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(selectedType)}
                onValueChange={(value) => {
                  setSelectedType(parseInt(value));
                  setNewRecurring({ ...newRecurring, class_id: 0 });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione o Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {types.map((type) => (
                    <SelectItem key={type.id} value={String(type.id)}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          {/* Class Select */}
          {selectedType && (
            <>
              <Label>
                Classe <span className="text-red-500">*</span>
              </Label>
              <Select
                value={String(newRecurring.class_id)}
                onValueChange={(value) =>
                  setNewRecurring({
                    ...newRecurring,
                    class_id: Number(value),
                  })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a Classe" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
            )}

            <Label>Valor <span className="text-red-500">*</span></Label>
            <Input
              type="number"
              min="1"
              value={newRecurring.value}
              onChange={(e) =>
                setNewRecurring({
                  ...newRecurring,
                  value: Number(e.target.value),
                })
              }
            />
            <Label>Descrição <span className="text-red-500">*</span></Label>
            <Input
              type="text"
              value={newRecurring.description}
              onChange={(e) =>
                setNewRecurring({
                  ...newRecurring,
                  description: e.target.value,
                })
              }
            />
            <Label>Frequência <span className="text-red-500">*</span></Label>
            <Select
  onValueChange={(value: string) =>
    setNewRecurring({ ...newRecurring, frequency: value })
  }
  value={newRecurring.frequency}
>

              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione a Frequência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Anual">Anual</SelectItem>
                <SelectItem value="Mensal">Mensal</SelectItem>
                <SelectItem value="Semanal">Semanal</SelectItem>
              </SelectContent>
            </Select>
            <Label>Data</Label>
            <DatePicker
              date={newRecurring.validity ? new Date(newRecurring.validity) : undefined}
              onSelect={(date: Date | undefined, _event?: any) =>
                setNewRecurring({
                  ...newRecurring,
                  validity: date ? date.toISOString().split("T")[0] : null,
                })
              }
            />
            {formError && <p className="text-red-500 text-sm">{formError}</p>}
            <Button onClick={handleCreate}>Salvar</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

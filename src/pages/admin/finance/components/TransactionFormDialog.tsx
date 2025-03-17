import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionCreateRequest } from "@/types/finance";
import { useState, useEffect } from "react";

import { Dimension } from "@/types/finance";
import { DatePicker } from "@/components/DatePicker";


interface TransactionFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  newTransaction: TransactionCreateRequest;
  setNewTransaction: (transaction: TransactionCreateRequest) => void;
  createTransaction: () => void;
  dimensions: Dimension[];
  isEditing: boolean;
  onClose: () => void;
}

export function TransactionFormDialog({
  open,
  setOpen,
  newTransaction,
  setNewTransaction,
  createTransaction,
  dimensions,
  isEditing,
  onClose,
}: TransactionFormDialogProps) {

  const [formError, setFormError] = useState<string>("");

  const [selectedType, setSelectedType] = useState<number | null>(null);
  const [selectedNature, setSelectedNature] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing && newTransaction.class_id && dimensions.length > 0) {
      for (const nature of dimensions) {
        for (const type of nature.types) {
          const found = type.classes.find(
            (c) => c.id == newTransaction.class_id
          );
          if (found) {
            setSelectedNature(nature.id);
            setSelectedType(type.id);
            break;
          }
        }
      }
    }
  }, [isEditing, newTransaction.class_id, dimensions]);

  const selectedNatureObj = dimensions.find(
    (n) => n.id == selectedNature
  );

  const types = selectedNatureObj ? selectedNatureObj.types : [];

  const selectedTypeObj = types.find((t) => t.id == selectedType);
  const classes = selectedTypeObj ? selectedTypeObj.classes : [];

  const handleSubmit = () => {
    if (!selectedNature) {
      setFormError("Selecione a Natureza.");
      return;
    }
    if (!selectedType) {
      setFormError("Selecione o Tipo.");
      return;
    }
    if (!newTransaction.class_id) {
      setFormError("Selecione a Classe.");
      return;
    }
    if (!newTransaction.value || newTransaction.value <= 0) {
      setFormError("Informe um Valor válido.");
      return;
    }
    if (!newTransaction.description.trim()) {
      setFormError("Informe a Descrição.");
      return;
    }
    if (
      !newTransaction.transaction_at ||
      isNaN(new Date(newTransaction.transaction_at).getTime())
    ) {
      setFormError("Selecione uma Data válida.");
      return;
    }
    setFormError("");
    createTransaction();
  };

  return (
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
          <Button>Adicionar Transação</Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Transação" : "Nova Transação"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4">
          {/* Nature Select */}
          <Label>
            Natureza <span className="text-red-500">*</span>
          </Label>
          <Select
            value={String(selectedNature)}
            onValueChange={(value) => {
              setSelectedNature(parseInt(value));
              setSelectedType(null);
              setNewTransaction({ ...newTransaction, class_id: 0 });
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
                  setNewTransaction({ ...newTransaction, class_id: 0 });
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
                value={String(newTransaction.class_id)}
                onValueChange={(value) =>
                  setNewTransaction({
                    ...newTransaction,
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

          {/* Valor */}
          <Label>
            Valor <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            min="1"
            required
            value={newTransaction.value}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                value: Number(e.target.value),
              })
            }
          />

          {/* Descrição */}
          <Label>
            Descrição <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            required
            value={newTransaction.description}
            onChange={(e) =>
              setNewTransaction({
                ...newTransaction,
                description: e.target.value,
              })
            }
          />

          {/* Data */}
          <Label>
            Data <span className="text-red-500">*</span>
          </Label>
          <DatePicker
            date={
              newTransaction.transaction_at &&
              !isNaN(new Date(newTransaction.transaction_at).getTime())
                ? new Date(newTransaction.transaction_at)
                : new Date()
            }
            onSelect={(date) =>
              setNewTransaction({
                ...newTransaction,
                transaction_at: date
                  ? date.toISOString()
                  : new Date().toISOString(),
              })
            }
          />

          {formError && <p className="text-red-500 text-sm">{formError}</p>}

          <Button onClick={handleSubmit}>
            {isEditing ? "Salvar Alterações" : "Salvar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useEffect, useState } from "react";

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

import { MonthYearPicker } from "@/components/MonthYearPicker";

import type {
  Dimension,
  MonthlyBudgetCreateRequest,
} from "@/types/finance";

interface BudgetFormDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  newBudget: MonthlyBudgetCreateRequest;
  setNewBudget: (budget: MonthlyBudgetCreateRequest) => void;
  saveBudget: () => void;
  dimensions: Dimension[];
  isEditing: boolean;
  onClose: () => void;
}

function getEmptyBudget(): MonthlyBudgetCreateRequest {
  return {
    type_id: null,
    class_id: null,
    budget_month: "",
    planned_value: 0,
  };
}

export function BudgetFormDialog({
  open,
  setOpen,
  newBudget,
  setNewBudget,
  saveBudget,
  dimensions,
  isEditing,
  onClose,
}: BudgetFormDialogProps) {
  const [formError, setFormError] = useState("");
  const [selectedNature, setSelectedNature] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<number | null>(null);

  useEffect(() => {
    if (isEditing && newBudget.type_id && dimensions.length > 0) {
      for (const nature of dimensions) {
        const foundType = nature.types.find(
          (type) => type.id === newBudget.type_id
        );

        if (foundType) {
          setSelectedNature(nature.id);
          setSelectedType(foundType.id);
          break;
        }
      }
    }
  }, [isEditing, newBudget.type_id, dimensions]);

  const selectedNatureObj = dimensions.find((n) => n.id === selectedNature);
  const types = selectedNatureObj ? selectedNatureObj.types : [];

  const selectedTypeObj = types.find((t) => t.id === selectedType);
  const classes = selectedTypeObj ? selectedTypeObj.classes : [];

  function handleSubmit() {
    if (!selectedNature) {
      setFormError("Selecione a Natureza.");
      return;
    }

    if (!selectedType) {
      setFormError("Selecione o Tipo.");
      return;
    }

    if (!newBudget.planned_value || newBudget.planned_value <= 0) {
      setFormError("Informe um Valor válido.");
      return;
    }

    if (!newBudget.budget_month) {
      setFormError("Selecione o Mês/Ano.");
      return;
    }

    setFormError("");
    saveBudget();
  }

  function clearInternalState() {
    setSelectedNature(null);
    setSelectedType(null);
    setFormError("");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(openVal) => {
        setOpen(openVal);

        if (!openVal) {
          clearInternalState();
          onClose();
        }
      }}
    >
      {!isEditing && (
        <DialogTrigger asChild>
          <Button
            onClick={() => {
              setNewBudget(getEmptyBudget());
              clearInternalState();
            }}
          >
            Adicionar Orçamento
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-md sm:max-w-lg w-full p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Orçamento" : "Novo Orçamento"}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-4">
          <Label>
            Natureza <span className="text-red-500">*</span>
          </Label>

          <Select
            value={selectedNature ? String(selectedNature) : ""}
            onValueChange={(value) => {
              setSelectedNature(Number(value));
              setSelectedType(null);
              setNewBudget({
                ...newBudget,
                type_id: null,
                class_id: null,
              });
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

          {selectedNature && (
            <>
              <Label>
                Tipo <span className="text-red-500">*</span>
              </Label>

              <Select
                value={selectedType ? String(selectedType) : ""}
                onValueChange={(value) => {
                  const typeId = Number(value);

                  setSelectedType(typeId);

                  setNewBudget({
                    ...newBudget,
                    type_id: typeId,
                    class_id: null,
                  });
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

          {selectedType && (
            <>
              <Label>Classe</Label>

              <Select
                value={newBudget.class_id ? String(newBudget.class_id) : "general"}
                onValueChange={(value) => {
                  setNewBudget({
                    ...newBudget,
                    class_id: value === "general" ? null : Number(value),
                  });
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione a Classe" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="general">Geral do Tipo</SelectItem>

                  {classes.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}

          <Label>
            Valor Planejado <span className="text-red-500">*</span>
          </Label>

          <Input
            type="number"
            min="1"
            step="0.01"
            required
            value={newBudget.planned_value || ""}
            placeholder="Ex: 650"
            onChange={(e) =>
              setNewBudget({
                ...newBudget,
                planned_value: Number(e.target.value),
              })
            }
          />

          <Label>
            Mês/Ano <span className="text-red-500">*</span>
          </Label>

          <MonthYearPicker
            value={newBudget.budget_month}
            onChange={(value) =>
              setNewBudget({
                ...newBudget,
                budget_month: value,
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
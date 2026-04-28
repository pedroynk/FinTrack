"use client";

import { useState } from "react";
import { Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Label } from "@/components/ui/label";

type DuplicateBudgetMode = "missing_only" | "replace";

interface DuplicateBudgetDialogProps {
    currentMonth: number;
    currentYear: number;
    disabled?: boolean;
    onDuplicate: (
        months: string[],
        mode: DuplicateBudgetMode
    ) => Promise<void>;
}

function getNextMonths(month: number, year: number, count = 6) {
    return Array.from({ length: count }, (_, index) => {
        const date = new Date(year, month - 1 + index + 1, 1);

        const budgetMonth = `${date.getFullYear()}-${String(
            date.getMonth() + 1
        ).padStart(2, "0")}-01`;

        const label = date.toLocaleString("pt-BR", {
            month: "long",
            year: "numeric",
        });

        return {
            value: budgetMonth,
            label: label.charAt(0).toUpperCase() + label.slice(1),
        };
    });
}

export function DuplicateBudgetDialog({
    currentMonth,
    currentYear,
    disabled = false,
    onDuplicate,
}: DuplicateBudgetDialogProps) {
    const [open, setOpen] = useState(false);
    const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
    const [mode, setMode] = useState<DuplicateBudgetMode>("missing_only");
    const [loading, setLoading] = useState(false);

    const months = getNextMonths(currentMonth, currentYear);

    function toggleMonth(month: string) {
        setSelectedMonths((prev) =>
            prev.includes(month)
                ? prev.filter((item) => item !== month)
                : [...prev, month]
        );
    }

    async function handleDuplicate() {
        if (selectedMonths.length === 0) return;

        setLoading(true);

        try {
            await onDuplicate(selectedMonths, mode);
            setSelectedMonths([]);
            setMode("missing_only");
            setOpen(false);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" disabled={disabled}>
                    <Copy className="mr-2 h-4 w-4" />
                    Duplicar orçamento
                </Button>
            </DialogTrigger>

            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>Duplicar orçamento</DialogTitle>
                </DialogHeader>

                <div className="space-y-5">
                    <div className="space-y-3">
                        <Label>Como duplicar?</Label>

                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="duplicate-mode"
                                    value="missing_only"
                                    checked={mode === "missing_only"}
                                    onChange={(event) =>
                                        setMode(event.target.value as DuplicateBudgetMode)
                                    }
                                    className="accent-primary"
                                />
                                Duplicar só faltantes
                            </label>

                            <label className="flex items-center gap-2 text-sm cursor-pointer">
                                <input
                                    type="radio"
                                    name="duplicate-mode"
                                    value="replace"
                                    checked={mode === "replace"}
                                    onChange={(event) =>
                                        setMode(event.target.value as DuplicateBudgetMode)
                                    }
                                    className="accent-primary"
                                />
                                Duplicar e substituir
                            </label>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label>Meses de destino</Label>

                        <div className="grid grid-cols-1 gap-3">
                            {months.map((month) => (
                                <label
                                    key={month.value}
                                    className={`
    flex items-center gap-3 rounded-md border p-3 cursor-pointer transition
    ${selectedMonths.includes(month.value)
                                            ? "border-primary bg-primary/10"
                                            : "hover:bg-muted/40"
                                        }
  `}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedMonths.includes(month.value)}
                                        onChange={() => toggleMonth(month.value)}
                                        className="accent-primary"
                                    />

                                    <span className="text-sm font-medium">{month.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleDuplicate}
                        disabled={loading || selectedMonths.length === 0}
                    >
                        {loading ? "Duplicando..." : "Duplicar"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
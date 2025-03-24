import { CheckCircle, ChevronDown, Pen, Trash2, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DynamicIcon, IconName } from "lucide-react/dynamic";
import { deleteRecurringApi, softDeleteRecurring, toggleParcelPayment } from "@/api/recurring";
import { useState } from "react";
import { Recurring } from "@/types/recurring";

interface Installment {
  label: string;
}

interface RecurringTableProps {
  recurring: any[];
  setRecurring: React.Dispatch<React.SetStateAction<any[]>>;
  confirmOpen: boolean;
  setConfirmOpen: (open: boolean) => void;
  confirmOpenSoft: boolean;
  setConfirmOpenSoft: (open: boolean) => void;
  confirmPaymentOpen: boolean;
  setConfirmPaymentOpen: (open: boolean) => void;
  selectedRecurring: any | null;
  setSelectedRecurring: (rec: any | null) => void;
  selectedParcel: { transactionId: string; installmentNumber: number } | null;
  setSelectedParcel: (parcel: { transactionId: string; installmentNumber: number } | null) => void;
  reloadRecurring: () => Promise<void>;
  handleEditRecurring: (recurring: Recurring) => void;
}

function getIcon(recurring: any) {
  if (recurring.class?.type?.lucide_icon) {
    return (
      <DynamicIcon
        name={recurring.class?.type?.lucide_icon as IconName}
        style={{ color: String(recurring.class?.type?.hex_color) }}
      />
    );
  }
}

export function RecurringTable({
  recurring,
  setRecurring,
  confirmOpen,
  setConfirmOpen,
  confirmOpenSoft,
  setConfirmOpenSoft,
  confirmPaymentOpen,
  setConfirmPaymentOpen,
  selectedRecurring,
  setSelectedRecurring,
  selectedParcel,
  setSelectedParcel,
  reloadRecurring,
  handleEditRecurring
}: RecurringTableProps) {
  const [expandedRows, setExpandedRows] = useState<{ [key: string]: boolean }>({});
  const [paymentAction, setPaymentAction] = useState<"mark" | "unmark" | null>(null);

  return (
    <div className="w-full overflow-x-auto max-w-full">
      <Table>
        <TableHeader className="text-sm">
          <TableRow>
            <TableHead></TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Classe</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead>Frequência</TableHead>
            <TableHead>Validade</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className="text-sm">
          {recurring.map((recurring) => {
            const paidParcels = recurring.paid_parcels || [];

            return (
              <>
                <TableRow key={recurring.id}>
                  <TableCell>{getIcon(recurring)}</TableCell>
                  <TableCell>{recurring.class?.type?.name || "Sem Tipo"}</TableCell>
                  <TableCell>{recurring.class?.name || "Sem Classe"}</TableCell>
                  <TableCell>R${recurring.value?.toFixed(2)}</TableCell>
                  <TableCell>{recurring.description || "Sem Descrição"}</TableCell>
                  <TableCell>{recurring.frequency}</TableCell>
                  <TableCell>
                    {new Date(recurring.validity).toLocaleDateString() === "12/31/1969"
                      ? "Sem Validade"
                      : new Date(recurring.validity).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setSelectedRecurring(recurring);
                        handleEditRecurring(recurring);
                      }}
                    >
                      <Pen className="text-blue-500" />
                    </Button>

                    {/* Marcar como paga (soft delete) */}
                    <AlertDialog open={confirmOpenSoft && selectedRecurring?.id === recurring.id} onOpenChange={setConfirmOpenSoft}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedRecurring(recurring)}>
                          <CheckCircle className="text-green-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>Tem certeza?</AlertDialogHeader>
                        <p>Deseja marcar esta Recorrência como paga?</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await softDeleteRecurring(recurring.id);
                              setConfirmOpenSoft(false);
                              reloadRecurring();
                            }}
                          >
                            Marcar como paga
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    {/* Excluir permanente */}
                    <AlertDialog open={confirmOpen && selectedRecurring?.id === recurring.id} onOpenChange={setConfirmOpen}>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={() => setSelectedRecurring(recurring)}>
                          <Trash2 className="text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>Tem certeza?</AlertDialogHeader>
                        <p>Deseja remover esta Recorrência?</p>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={async () => {
                              await deleteRecurringApi(recurring.id);
                              setConfirmOpen(false);
                              reloadRecurring();
                            }}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>

                    <Button variant="ghost" size="icon" onClick={() => setExpandedRows(prev => ({ ...prev, [recurring.id]: !prev[recurring.id] }))}>
                      <ChevronDown className={`transition-transform ${expandedRows[recurring.id] ? "rotate-180" : ""}`} />
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Parcelas (expandido) */}
                {expandedRows[recurring.id] && (
                  <TableRow className="w-full">
                    <TableCell colSpan={8}>
                      <div className="w-full">
                        <h3 className="font-semibold">Parcelas</h3>
                        <div>
                          {typeof recurring.installments === "string" ? (
                            <p>{recurring.installments}</p>
                          ) : (
                            recurring.installments.map((installment: Installment, index: number) => {
                              const installmentNumber = index + 1;
                              const isPaid = paidParcels.includes(installmentNumber);

                              return (
                                <div key={index} className="flex items-center justify-between p-2 border-b">
                                  <span>{installment.label}</span>

                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => {
                                      setSelectedParcel({ transactionId: recurring.id, installmentNumber });

                                      if (isPaid) {
                                        setPaymentAction("unmark"); // desmarcar
                                      } else {
                                        setPaymentAction("mark"); // marcar
                                      }

                                      setConfirmPaymentOpen(true);
                                    }}
                                  >
                                    {isPaid ? (
                                      <XCircle className="text-red-500" />
                                    ) : (
                                      <CheckCircle className="text-green-500" />
                                    )}
                                  </Button>

                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>

      {/* Confirmação de pagamento de parcela */}
      <AlertDialog open={confirmPaymentOpen} onOpenChange={setConfirmPaymentOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>Confirmar Pagamento</AlertDialogHeader>

          <p>
            {paymentAction === "mark"
              ? "Deseja marcar esta parcela como paga? Será registrada como transação."
              : "Deseja desmarcar esta parcela como paga?"}
          </p>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedParcel) {
                  toggleParcelPayment(
                    selectedParcel.transactionId,
                    selectedParcel.installmentNumber,
                    recurring.find(t => t.id === selectedParcel.transactionId)?.paid_parcels || [],
                    setRecurring
                  );
                }
                setConfirmPaymentOpen(false);
              }}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
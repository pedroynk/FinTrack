interface InvestmentSummaryProps {
    totalInvested: number;
    totalUpdated: number;
    totalGain: number;
}

export function InvestmentSummary({ totalInvested, totalUpdated, totalGain }: InvestmentSummaryProps) {
    return (
        <div style={{ display: "flex", justifyContent: "space-between", gap: "20px", padding: "20px" }}>
            <div style={{ background: "#e0f7fa", padding: "20px", borderRadius: "10px", width: "30%", textAlign: "center" }}>
                <h3>Saldo Atual</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                    R$ {totalUpdated.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            <div style={{ background: "#f5f5f5", padding: "20px", borderRadius: "10px", width: "30%", textAlign: "center" }}>
                <h3>Total Investido</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold" }}>
                    R$ {totalInvested.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
            <div style={{ background: totalGain >= 0 ? "#dcedc8" : "#ffcdd2", padding: "20px", borderRadius: "10px", width: "30%", textAlign: "center" }}>
                <h3>Saldo Acumulado</h3>
                <p style={{ fontSize: "24px", fontWeight: "bold", color: totalGain >= 0 ? "#2e7d32" : "#c62828" }}>
                    R$ {totalGain.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
            </div>
        </div>
    );
}
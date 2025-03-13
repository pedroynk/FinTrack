import { ReactNode } from "react";

interface ChartContainerProps {
    id: string;
    children: ReactNode;
    className?: string;
}

export function ChartContainer({ id, children, className = "" }: ChartContainerProps) {
    return (
        <div id={id} className={`chart-container min-h-[300px] w-full ${className}`}>
            {children}
        </div>
    );
}


interface ChartStyleProps {
    id: string;
}

export function ChartStyle({ id }: ChartStyleProps) {
    return <style>{`/* Custom styles for ${id} */`}</style>;
}

interface ChartTooltipProps {
    active?: boolean;
    payload?: any[];
}

export function ChartTooltip({ active, payload }: ChartTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white shadow-md rounded-md p-2 border border-gray-200">
                <p className="text-xs text-gray-600">{payload[0].name}</p>
                <p className="text-sm font-semibold">{`${payload[0].value}%`}</p>
            </div>
        );
    }
    return null;
}

interface ChartTooltipContentProps {
    hideLabel?: boolean;
}

export function ChartTooltipContent({ hideLabel }: ChartTooltipContentProps) {
    return hideLabel ? null : <span className="text-sm text-gray-600">Tooltip</span>;
}

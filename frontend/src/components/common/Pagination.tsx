import { ChevronLeft, ChevronRight } from "lucide-react";
import type React from "react";

interface Props {
	currentPage: number;
	totalPages: number;
	onPageChange: (page: number) => void;
	pageSize?: number;
	totalItems?: number;
	onPageSizeChange?: (size: number) => void;
	pageSizeOptions?: number[];
}

export const Pagination: React.FC<Props> = ({
	currentPage,
	totalPages,
	onPageChange,
	pageSize,
	totalItems,
	onPageSizeChange,
	pageSizeOptions = [10, 25, 50],
}) => {
	// Only hide pagination if there are literally 0 items
	if (totalItems === 0 || (!totalItems && totalPages === 0)) {
		return null;
	}

	const startItem = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
	const endItem =
		pageSize && totalItems
			? Math.min(currentPage * pageSize, totalItems)
			: undefined;

	// Generate page numbers to display
	const getPageNumbers = () => {
		const pages: (number | string)[] = [];
		if (totalPages <= 7) {
			for (let i = 1; i <= totalPages; i++) pages.push(i);
		} else {
			if (currentPage <= 4) {
				pages.push(1, 2, 3, 4, 5, "...", totalPages);
			} else if (currentPage >= totalPages - 3) {
				pages.push(
					1,
					"...",
					totalPages - 4,
					totalPages - 3,
					totalPages - 2,
					totalPages - 1,
					totalPages,
				);
			} else {
				pages.push(
					1,
					"...",
					currentPage - 1,
					currentPage,
					currentPage + 1,
					"...",
					totalPages,
				);
			}
		}
		return pages;
	};

	return (
		<div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 bg-white border-t border-slate-200 text-xs min-w-0 max-w-full">
			{/* Items Range & Page Size Selector */}
			<div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 text-slate-500 text-center sm:text-left">
				{startItem && endItem && totalItems !== undefined && (
					<span>
						Menampilkan{" "}
						<strong className="text-slate-800 font-mono font-medium">
							{startItem}-{endItem}
						</strong>{" "}
						dari{" "}
						<strong className="text-slate-800 font-mono font-medium">
							{totalItems}
						</strong>{" "}
						data
					</span>
				)}

				{onPageSizeChange && pageSize && (
					<div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
						<span className="text-[11px]">Baris:</span>
						<select
							value={pageSize}
							onChange={(e) => {
								onPageSizeChange(Number(e.target.value));
								onPageChange(1);
							}}
							className="px-1.5 py-0.5 rounded-md border border-slate-200 bg-white text-slate-800 text-[11px] focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer"
						>
							{pageSizeOptions.map((opt) => (
								<option key={opt} value={opt}>
									{opt}
								</option>
							))}
						</select>
					</div>
				)}
			</div>

			{/* Page Navigation Controls */}
			<div className="flex flex-wrap items-center justify-center gap-1">
				<button
					type="button"
					onClick={() => onPageChange(Math.max(1, currentPage - 1))}
					disabled={currentPage <= 1}
					className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
					title="Halaman Sebelumnya"
				>
					<ChevronLeft size={14} />
				</button>

				{getPageNumbers().map((p, idx) => {
					if (p === "...") {
						return (
							<span
								key={`ellipsis-${idx}`}
								className="px-2 py-1 text-slate-400"
							>
								...
							</span>
						);
					}

					const pageNum = Number(p);
					const isActive = pageNum === currentPage;

					return (
						<button
							key={pageNum}
							type="button"
							onClick={() => onPageChange(pageNum)}
							className={`min-w-[28px] h-7 px-2 rounded-lg font-mono text-xs font-medium transition-colors cursor-pointer ${
								isActive
									? "bg-blue-600 text-white shadow-xs"
									: "text-slate-600 hover:bg-slate-100 border border-slate-200"
							}`}
						>
							{pageNum}
						</button>
					);
				})}

				<button
					type="button"
					onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
					disabled={currentPage >= totalPages}
					className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer disabled:cursor-not-allowed"
					title="Halaman Selanjutnya"
				>
					<ChevronRight size={14} />
				</button>
			</div>
		</div>
	);
};

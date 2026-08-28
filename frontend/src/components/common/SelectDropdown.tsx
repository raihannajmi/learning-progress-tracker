import { Check, ChevronDown, Search, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

export interface SelectOption {
	value: string;
	label: string;
	badge?: string;
	description?: string;
	icon?: React.ComponentType<{ size?: number; className?: string }>;
}

interface SelectDropdownProps {
	options: SelectOption[];
	value?: string;
	onChange: (value: string) => void;
	placeholder?: string;
	label?: string;
	searchable?: boolean;
	allowClear?: boolean;
	className?: string;
	disabled?: boolean;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
	options,
	value,
	onChange,
	placeholder = "Pilih opsi...",
	label,
	searchable = false,
	allowClear = false,
	className = "",
	disabled = false,
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const containerRef = useRef<HTMLDivElement>(null);

	// Close on outside click
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target as Node)
			) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const selectedOption = options.find((opt) => opt.value === value);

	const filteredOptions = searchable
		? options.filter((opt) =>
				opt.label.toLowerCase().includes(searchQuery.toLowerCase()),
			)
		: options;

	return (
		<div
			className={`relative ${isOpen ? "z-30" : ""} ${className}`}
			ref={containerRef}
		>
			{label && (
				<label className="block text-xs font-medium text-slate-700 mb-1">
					{label}
				</label>
			)}

			{/* Dropdown Trigger */}
			<div className="relative flex items-center">
				<button
					type="button"
					disabled={disabled}
					onClick={() => !disabled && setIsOpen(!isOpen)}
					className={`w-full px-3 py-2 bg-white border rounded-lg text-xs flex items-center justify-between gap-2 transition-all text-left ${
						disabled
							? "bg-slate-50 text-slate-400 border-slate-200 cursor-not-allowed"
							: isOpen
								? "border-blue-500 ring-2 ring-blue-500/20 cursor-pointer"
								: "border-slate-200 hover:border-slate-300 cursor-pointer"
					}`}
				>
					<div className="flex items-center gap-2 min-w-0 flex-1">
						{selectedOption?.icon && (
							<selectedOption.icon
								size={14}
								className="text-slate-500 shrink-0"
							/>
						)}
						<span
							className={`truncate ${
								selectedOption ? "font-medium text-slate-900" : "text-slate-400"
							}`}
						>
							{selectedOption ? selectedOption.label : placeholder}
						</span>
						{selectedOption?.badge && (
							<span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
								{selectedOption.badge}
							</span>
						)}
					</div>

					<div className="flex items-center gap-1 shrink-0 pl-1">
						<ChevronDown
							size={14}
							className={`text-slate-400 transition-transform duration-150 ${
								isOpen ? "rotate-180 text-blue-600" : ""
							}`}
						/>
					</div>
				</button>

				{allowClear && selectedOption && !disabled && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onChange("");
						}}
						className="absolute right-7 p-1 text-slate-400 hover:text-slate-600 rounded-sm cursor-pointer"
						title="Reset Pilihan"
					>
						<X size={12} />
					</button>
				)}
			</div>

			{/* Dropdown Menu Popover */}
			{isOpen && (
				<div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 max-h-60 flex flex-col">
					{searchable && (
						<div className="p-2 border-b border-slate-100 bg-slate-50/50">
							<div className="relative">
								<Search
									size={13}
									className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
								/>
								<input
									type="text"
									value={searchQuery}
									onChange={(e) => setSearchQuery(e.target.value)}
									placeholder="Cari..."
									className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:border-blue-500"
								/>
							</div>
						</div>
					)}

					<div className="overflow-y-auto divide-y divide-slate-50 p-1">
						{filteredOptions.length === 0 ? (
							<div className="p-3 text-center text-xs text-slate-400">
								Tidak ada pilihan ditemukan
							</div>
						) : (
							filteredOptions.map((opt) => {
								const isSelected = opt.value === value;
								return (
									<button
										key={opt.value}
										type="button"
										onClick={() => {
											onChange(opt.value);
											setIsOpen(false);
											setSearchQuery("");
										}}
										className={`w-full text-left p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 transition-colors cursor-pointer ${
											isSelected
												? "bg-blue-50/80 text-blue-900 font-semibold"
												: "text-slate-700 hover:bg-slate-50"
										}`}
									>
										<div className="flex items-center gap-2 min-w-0">
											{opt.icon && (
												<opt.icon
													size={14}
													className={
														isSelected ? "text-blue-600" : "text-slate-400"
													}
												/>
											)}
											<div className="min-w-0">
												<p className="truncate">{opt.label}</p>
												{opt.description && (
													<p className="text-[11px] text-slate-400 truncate">
														{opt.description}
													</p>
												)}
											</div>
										</div>

										<div className="flex items-center gap-1.5 shrink-0">
											{opt.badge && (
												<span
													className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
														isSelected
															? "bg-blue-100 text-blue-700"
															: "bg-slate-100 text-slate-600"
													}`}
												>
													{opt.badge}
												</span>
											)}
											{isSelected && (
												<Check size={14} className="text-blue-600" />
											)}
										</div>
									</button>
								);
							})
						)}
					</div>
				</div>
			)}
		</div>
	);
};

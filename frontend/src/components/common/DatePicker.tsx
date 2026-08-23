import {
	Calendar as CalendarIcon,
	ChevronLeft,
	ChevronRight,
	X,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";

interface DatePickerProps {
	value?: string | null; // ISO string or YYYY-MM-DD
	onChange: (dateStr: string) => void;
	placeholder?: string;
	label?: string;
	className?: string;
}

const MONTH_NAMES = [
	"Januari",
	"Februari",
	"Maret",
	"April",
	"Mei",
	"Juni",
	"Juli",
	"Agustus",
	"September",
	"Oktober",
	"November",
	"Desember",
];

const DAY_NAMES = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const DatePicker: React.FC<DatePickerProps> = ({
	value,
	onChange,
	placeholder = "Pilih Tanggal Mulai",
	label,
	className = "",
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const containerRef = useRef<HTMLDivElement>(null);

	const initialDate = value ? new Date(value) : new Date();
	const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
	const [currentYear, setCurrentYear] = useState(initialDate.getFullYear());

	// Close on click outside
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

	const selectedDate = value ? new Date(value) : null;

	const handlePrevMonth = () => {
		if (currentMonth === 0) {
			setCurrentMonth(11);
			setCurrentYear((y) => y - 1);
		} else {
			setCurrentMonth((m) => m - 1);
		}
	};

	const handleNextMonth = () => {
		if (currentMonth === 11) {
			setCurrentMonth(0);
			setCurrentYear((y) => y + 1);
		} else {
			setCurrentMonth((m) => m + 1);
		}
	};

	// Days in current month calculation
	const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
	const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

	const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
	const blanksArray = Array.from({ length: firstDayOfMonth }, (_, i) => i);

	const handleSelectDay = (day: number) => {
		const pad = (n: number) => String(n).padStart(2, "0");
		const dateStr = `${currentYear}-${pad(currentMonth + 1)}-${pad(day)}`;
		onChange(dateStr);
		setIsOpen(false);
	};

	const formattedDisplay = selectedDate
		? new Intl.DateTimeFormat("id-ID", {
				weekday: "short",
				day: "numeric",
				month: "short",
				year: "numeric",
			}).format(selectedDate)
		: null;

	return (
		<div className={`relative ${className}`} ref={containerRef}>
			{label && (
				<label className="block text-xs font-medium text-slate-700 mb-1">
					{label}
				</label>
			)}

			{/* Trigger Button */}
			<div className="relative flex items-center">
				<button
					type="button"
					onClick={() => setIsOpen(!isOpen)}
					className={`w-full px-3 py-2 bg-white border rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-all text-left ${
						isOpen
							? "border-blue-500 ring-2 ring-blue-500/20"
							: "border-slate-200 hover:border-slate-300"
					}`}
				>
					<div className="flex items-center gap-2 min-w-0">
						<CalendarIcon
							size={14}
							className={formattedDisplay ? "text-blue-600" : "text-slate-400"}
						/>
						<span
							className={`truncate ${
								formattedDisplay
									? "font-medium text-slate-900"
									: "text-slate-400"
							}`}
						>
							{formattedDisplay || placeholder}
						</span>
					</div>

					{!formattedDisplay && (
						<ChevronRight size={13} className="text-slate-400" />
					)}
				</button>

				{formattedDisplay && (
					<button
						type="button"
						onClick={(e) => {
							e.stopPropagation();
							onChange("");
						}}
						className="absolute right-2 p-1 text-slate-400 hover:text-slate-600 rounded-sm cursor-pointer"
						title="Hapus Tanggal"
					>
						<X size={13} />
					</button>
				)}
			</div>

			{/* Calendar Popover */}
			{isOpen && (
				<div className="absolute top-full left-0 mt-1 z-50 bg-white rounded-xl shadow-xl border border-slate-200 p-3.5 w-64 animate-in fade-in zoom-in-95">
					{/* Month/Year Header */}
					<div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-100">
						<button
							type="button"
							onClick={handlePrevMonth}
							className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
						>
							<ChevronLeft size={14} />
						</button>
						<span className="text-xs font-bold text-slate-800">
							{MONTH_NAMES[currentMonth]} {currentYear}
						</span>
						<button
							type="button"
							onClick={handleNextMonth}
							className="p-1 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
						>
							<ChevronRight size={14} />
						</button>
					</div>

					{/* Days of Week */}
					<div className="grid grid-cols-7 gap-1 text-center mb-1">
						{DAY_NAMES.map((name) => (
							<span
								key={name}
								className="text-[10px] font-semibold text-slate-400"
							>
								{name}
							</span>
						))}
					</div>

					{/* Calendar Grid */}
					<div className="grid grid-cols-7 gap-1 text-center text-xs">
						{blanksArray.map((blank) => (
							<div key={`blank-${blank}`} className="w-7 h-7" />
						))}

						{daysArray.map((day) => {
							const isSelected =
								selectedDate &&
								selectedDate.getDate() === day &&
								selectedDate.getMonth() === currentMonth &&
								selectedDate.getFullYear() === currentYear;

							const isToday =
								new Date().getDate() === day &&
								new Date().getMonth() === currentMonth &&
								new Date().getFullYear() === currentYear;

							return (
								<button
									key={day}
									type="button"
									onClick={() => handleSelectDay(day)}
									className={`w-7 h-7 rounded-lg text-[11px] font-medium flex items-center justify-center transition-colors cursor-pointer ${
										isSelected
											? "bg-blue-600 text-white font-bold shadow-xs"
											: isToday
												? "bg-blue-50 text-blue-700 font-bold border border-blue-200"
												: "text-slate-700 hover:bg-slate-100"
									}`}
								>
									{day}
								</button>
							);
						})}
					</div>

					{/* Quick Actions Footer */}
					<div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-100 text-[11px]">
						<button
							type="button"
							onClick={() => {
								const today = new Date();
								const pad = (n: number) => String(n).padStart(2, "0");
								onChange(
									`${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
								);
								setIsOpen(false);
							}}
							className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
						>
							Hari Ini
						</button>
						<button
							type="button"
							onClick={() => {
								onChange("");
								setIsOpen(false);
							}}
							className="text-slate-500 hover:text-slate-700 cursor-pointer"
						>
							Reset
						</button>
					</div>
				</div>
			)}
		</div>
	);
};

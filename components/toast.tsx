"use client";

import { createContext, useCallback, useContext, useState } from "react";

interface Toast {
	id: string;
	message: string;
	type: "success" | "error" | "info";
}

interface ToastContextValue {
	toast: (message: string, type?: Toast["type"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const toast = useCallback((message: string, type: Toast["type"] = "info") => {
		const id = Math.random().toString(36).slice(2);
		setToasts((prev) => [...prev, { id, message, type }]);
		setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
		}, 4000);
	}, []);

	return (
		<ToastContext.Provider value={{ toast }}>
			{children}
			<div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`animate-slide-up rounded-xl border px-5 py-3 text-sm font-medium shadow-lg backdrop-blur ${
							t.type === "success"
								? "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-400"
								: t.type === "error"
									? "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400"
									: "border-border bg-card text-foreground"
						}`}
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast must be used within ToastProvider");
	return ctx;
}

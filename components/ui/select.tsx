"use client";

import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

function Select({ ...props }: SelectPrimitive.Root.Props<any>) {
	return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectTrigger({
	className,
	children,
	...props
}: SelectPrimitive.Trigger.Props) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			className={cn(
				"flex h-9 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon data-slot="select-icon">
				<ChevronDownIcon className="size-4 opacity-50" />
			</SelectPrimitive.Icon>
		</SelectPrimitive.Trigger>
	);
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return (
		<SelectPrimitive.Value
			data-slot="select-value"
			className={cn("text-sm", className)}
			{...props}
		/>
	);
}

function SelectContent({
	className,
	children,
	...props
}: SelectPrimitive.Popup.Props) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner>
				<SelectPrimitive.Popup
					data-slot="select-content"
					className={cn(
						"z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
						className,
					)}
					{...props}
				>
					{children}
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				"relative flex w-full cursor-pointer select-none items-center rounded-md py-1.5 pl-2 pr-8 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 data-[selected]:bg-accent data-[selected]:text-accent-foreground",
				className,
			)}
			{...props}
		>
			<span className="absolute right-2 flex size-3.5 items-center justify-center">
				<SelectPrimitive.ItemIndicator>✓</SelectPrimitive.ItemIndicator>
			</span>
			<SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
		</SelectPrimitive.Item>
	);
}

function SelectLabel({ className, ...props }: SelectPrimitive.Label.Props) {
	return (
		<SelectPrimitive.Label
			data-slot="select-label"
			className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)}
			{...props}
		/>
	);
}

function SelectSeparator({ className, ...props }: React.ComponentProps<"div">) {
	return (
		<div
			data-slot="select-separator"
			className={cn("-mx-1 my-1 h-px bg-muted", className)}
			{...props}
		/>
	);
}

export {
	Select,
	SelectContent,
	SelectItem,
	SelectLabel,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};

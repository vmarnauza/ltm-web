import Spinner from "@/components/spinner";
import { MouseEvent, ReactNode } from "react";

export type ButtonType = "primary" | "secondary" | "highlighted";
export type ButtonSize = "small" | "medium" | "rectangular";
export interface ButtonProps {
  children: ReactNode;
  type?: ButtonType;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  isSubmit?: boolean;
  form?: string;
  disableTransition?: boolean;
  href?: string;
  target?: string;
  onClick?(event: MouseEvent<HTMLButtonElement>): void;
}

export default function Button({
  children = "",
  type = "primary",
  size = "medium",
  loading = false,
  disabled = false,
  disableTransition = false,
  isSubmit,
  form,
  href,
  target,
  onClick,
  className,
}: ButtonProps) {
  const typeClasses = getButtonTypeClasses(type);
  const sizeClasses = getButtonSizeClasses(size);
  const shadowClasses = "";
  // "shadow-[inset_1px_0_#a855f7,_inset_-1px_0_#a855f7,_inset_0_1px_#a855f7,_inset_0_-3px_#a855f7]";
  const transitionClasses = disableTransition
    ? null
    : "transition-all duration-200";
  const stateClasses =
    "disabled:bg-gray-200 disabled:border-gray-200 disabled:text-gray-400 md:hover:outline-double md:hover:outline-8";
  const loadingClasses = loading && "pointer-events-none";
  const classes = `${typeClasses} ${sizeClasses} ${stateClasses} ${transitionClasses} ${loadingClasses} ${shadowClasses}`;
  const containerClasses = `relative flex justify-center items-center flex-nowrap gap-2 rounded-[32px] shadow-2xl shadow-black font-medium whitespace-nowrap ${classes} ${className}`;
  const loaderMarkup = loading ? (
    <div
      className={`absolute top-0 left-0 w-full h-full flex justify-center items-center ${classes}`}
    >
      <Spinner />
    </div>
  ) : null;

  if (href) {
    return (
      <a
        className={containerClasses}
        href={href}
        target={target}
        rel="noopener noreferrer"
      >
        {children}
        {loaderMarkup}
      </a>
    );
  }

  return (
    <button
      className={containerClasses}
      disabled={disabled}
      onClick={onClick}
      type={isSubmit ? "submit" : "button"}
      form={form}
    >
      {children}
      {loaderMarkup}
    </button>
  );
}

function getButtonTypeClasses(type: ButtonType): string {
  switch (type) {
    case "secondary":
      return "border text-black bg-white border-black";
    case "highlighted":
      return "bg-lime-500 text-white border-gray-900";
    case "primary":
    default:
      return "text-white bg-gray-900 outline outline-gray-100 outline-offset-4";
  }
}

function getButtonSizeClasses(size: ButtonSize): string {
  switch (size) {
    case "rectangular":
      return "p-2 max-w-[40px] max-h-[40px]";
    case "small":
      return "px-3 py-2 max-h-[40px]";
    case "medium":
    default:
      return "px-4 py-4 max-h-[56px]";
  }
}

import clsx from "clsx";

export function MessageBubble({ role, content }: { role: "user" | "assistant"; content: string; }) {
  const isUser = role === "user";
  return (
    <div className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div className={clsx(
        "max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6",
        isUser ? "glass" : "bg-white/5 border border-white/10"
      )}>
        {content}
      </div>
    </div>
  );
}








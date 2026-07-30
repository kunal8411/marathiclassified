import { format } from "date-fns";

import { cn } from "@/lib/utils";

type MessageBubbleProps = {
  body: string;
  isOwn?: boolean;
  createdAt?: string | Date;
};

export function MessageBubble({ body, isOwn, createdAt }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
          isOwn
            ? "rounded-br-md bg-primary text-primary-foreground"
            : "rounded-bl-md bg-muted text-foreground",
        )}
      >
        <p className="whitespace-pre-wrap">{body}</p>
        {createdAt ? (
          <p
            className={cn(
              "mt-1 text-[10px]",
              isOwn ? "text-primary-foreground/70" : "text-muted-foreground",
            )}
          >
            {format(new Date(createdAt), "HH:mm")}
          </p>
        ) : null}
      </div>
    </div>
  );
}

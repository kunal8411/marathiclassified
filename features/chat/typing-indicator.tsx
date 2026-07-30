export function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-2 text-xs text-muted-foreground">
        <span className="inline-flex gap-1">
          <span className="animate-bounce">•</span>
          <span className="animate-bounce [animation-delay:120ms]">•</span>
          <span className="animate-bounce [animation-delay:240ms]">•</span>
        </span>
      </div>
    </div>
  );
}

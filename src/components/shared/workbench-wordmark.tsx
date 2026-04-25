type Props = {
  /** First name (or full name) of the board owner. Defaults to "Your" when absent. */
  ownerName?: string | null;
};

/** App title — JetBrains Mono; used in unified shell header. */
export function WorkbenchWordmark({ ownerName }: Props) {
  const possessive = ownerName ? `${ownerName}'s` : "Your";
  return (
    <span className="font-wordmark text-base tracking-tight text-foreground whitespace-nowrap">
      <span className="font-semibold text-foreground/80">{possessive}</span>
      <span className="font-medium"> Workbench</span>
    </span>
  );
}

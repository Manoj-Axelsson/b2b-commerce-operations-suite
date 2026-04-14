import { Button } from "@/components/ui/Button";

type SubmitButtonProps = React.ComponentProps<typeof Button>;

export function SubmitButton({ className, ...props }: SubmitButtonProps) {
  return (
    <Button type="submit" className={`w-full ${className ?? ""}`} {...props} />
  );
}

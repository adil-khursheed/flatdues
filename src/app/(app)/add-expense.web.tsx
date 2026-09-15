import { useRouter } from "expo-router";
import { Button, EmptyState, Screen } from "@/components";
import { icons } from "@/lib/icons";
import { spacing } from "@/theme";

export default function AddExpenseWebRoute() {
  const router = useRouter();

  return (
    <Screen contentStyle={{ justifyContent: "center", padding: spacing.lg }}>
      <EmptyState
        action={
          <Button
            leadingIcon={icons.actions.back}
            onPress={() => router.dismissTo("/home")}
            variant="secondary"
          >
            Back to Home
          </Button>
        }
        description="Expense creation is currently available in the Flatdues Android and iOS apps."
        icon={icons.entities.expense}
        title="Use the native app"
      />
    </Screen>
  );
}

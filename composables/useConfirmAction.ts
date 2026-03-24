export default function useConfirmAction() {
  const confirmAndRun = async (confirmMessage: string, action: () => Promise<void> | void) => {
    if (!confirm(confirmMessage)) return false
    await action()
    return true
  }

  return {
    confirmAndRun,
  }
}

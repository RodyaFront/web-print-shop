/**
 * Sync a Vue open flag with a native <dialog> (showModal / close).
 * Prefer this over inventing focus-trap + scroll-lock from scratch.
 */
export function useDialog(open: Ref<boolean>) {
  const dialogRef = ref<HTMLDialogElement | null>(null)

  function sync() {
    const el = dialogRef.value
    if (!el) return
    if (open.value && !el.open) {
      el.showModal()
      return
    }
    if (!open.value && el.open) {
      el.close()
    }
  }

  watch(open, () => {
    nextTick(sync)
  })

  onMounted(() => {
    sync()
  })

  function requestClose() {
    dialogRef.value?.close()
  }

  return {
    dialogRef,
    requestClose,
  }
}

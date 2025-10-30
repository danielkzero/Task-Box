import { ref, nextTick } from "vue";

export function useListScroll() {
  const listMenuRef = ref<HTMLElement | null>(null);

  async function scrollToSelectedList() {
    await nextTick(); // aguarda renderização

    if (!listMenuRef.value) return;

    const activeButton = listMenuRef.value.querySelector(
      `ion-button[color="primary"]`
    ) as HTMLElement | null;

    if (activeButton) {
      activeButton.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
  }

  return {
    listMenuRef,
    scrollToSelectedList,
  };
}

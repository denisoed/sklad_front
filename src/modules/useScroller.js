const useScroller = () => {
  function scrollBySelector(id) {
    if (id) {
      const selector = document.querySelector(`[data-scroller="${id}"]`)
      if (selector) {
        selector?.focus?.();
        selector.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }
  }

  return {
    scrollBySelector,
  }
}

export default useScroller;
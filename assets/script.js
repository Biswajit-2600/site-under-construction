// Force mobile view on mobile/touch devices - runs immediately
function isMobileDevice() {
  // Check for touch capability, small screen, or mobile user agent
  return (
    "ontouchstart" in window ||
    window.innerWidth <= 1024 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    )
  );
}

function forceMobileView() {
  if (isMobileDevice()) {
    // Ensure mobile content is visible and desktop is hidden
    const mobileContent = document.querySelector(".mobile-content");
    const desktopContent = document.querySelector(".desktop-content");
    const animationWrapper = document.querySelector(".animation-wrapper");

    if (mobileContent && desktopContent && animationWrapper) {
      mobileContent.style.display = "flex !important";
      desktopContent.style.display = "none !important";
      animationWrapper.style.display = "none !important";

      // Also ensure body doesn't have desktop overflow settings
      document.body.style.overflow = "hidden";
    }
  }
}

// Run immediately when script loads
forceMobileView();

// Run again when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", forceMobileView);
} else {
  forceMobileView();
}

// Apply mobile view on page load and resize
window.addEventListener("load", forceMobileView);
window.addEventListener("resize", forceMobileView);
window.addEventListener("orientationchange", forceMobileView);

// Check frequently in case user agent changes (desktop site request)
setInterval(forceMobileView, 500);

// Override any CSS that might show desktop content
const style = document.createElement("style");
style.textContent = `
        @media (hover: none) and (pointer: coarse) {
          /* Touch devices - force mobile view */
          .mobile-content { display: flex !important; }
          .desktop-content { display: none !important; }
          .animation-wrapper { display: none !important; }
        }
      `;
document.head.appendChild(style);

// Pull to refresh functionality
const refreshContainer = document.querySelector(".pull-to-refresh");
const icon = document.querySelector(".refresh-icon");

let startY = 0;
let isDragging = false;
let isRefreshing = false;
let currentPull = 0; // track current pull distance explicitly
const maxPull = 50; // maximum pull distance
const triggerDistance = 20; // distance required to trigger refresh

function onTouchStart(e) {
  if (!refreshContainer || !icon) return;
  // Only start if at top and not already refreshing
  if (window.scrollY <= 0 && !isRefreshing) {
    startY = e.touches[0].clientY;
    currentPull = 0;
    isDragging = true;
  }
}

function onTouchMove(e) {
  if (!isDragging || !refreshContainer || !icon) return;
  const currentY = e.touches[0].clientY;
  const pullDistance = Math.min(Math.max(currentY - startY, 0), maxPull);
  currentPull = pullDistance;

  if (pullDistance > 0) {
    // Need passive:false to allow preventDefault on mobile browsers
    e.preventDefault();
    const progress = pullDistance / maxPull;
    // Move container proportionally (less than actual drag)
    // Move even less during drag so icon stays very close to top
    refreshContainer.style.transform = `translateY(${pullDistance * 0.12}px)`;
    // Show & rotate icon smoothly up to 180deg
    icon.style.opacity = 1;
    icon.style.transform = `rotate(${progress * 180}deg)`;
  }
}

function onTouchEnd() {
  if (!isDragging || !refreshContainer || !icon) return;
  isDragging = false;
  // Decide based on tracked currentPull, not parsing style
  if (currentPull >= triggerDistance) {
    startRefresh();
  } else {
    resetPull();
  }
}

function startRefresh() {
  if (isRefreshing) return;
  isRefreshing = true;
  refreshContainer.classList.add("refreshing");
  // Keep container partially visible
  // Keep icon very close to top during refresh
  refreshContainer.style.transform = "translateY(6px)";
  icon.style.opacity = 1;
  // Simulate async refresh
  setTimeout(() => {
    stopRefresh();
    window.location.reload();
  }, 1200); // slightly faster
}

function stopRefresh() {
  isRefreshing = false;
  refreshContainer.classList.remove("refreshing");
  resetPull();
}

function resetPull() {
  currentPull = 0;
  refreshContainer.style.transform = "translateY(-100%)";
  icon.style.opacity = 0;
  icon.style.transform = "rotate(0deg)";
}

// Register listeners with passive:false for touchmove
window.addEventListener("touchstart", onTouchStart, { passive: true });
window.addEventListener("touchmove", onTouchMove, { passive: false });
window.addEventListener("touchend", onTouchEnd, { passive: true });

let toastContainer = null

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div')
    toastContainer.className = 'fixed top-4 right-4 z-[100] space-y-2'
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

export function showToast(message, type = 'success', duration = 3000) {
  const container = getToastContainer()
  
  const toast = document.createElement('div')
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  
  const colors = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    warning: 'bg-orange-600',
    info: 'bg-blue-600'
  }
  
  toast.className = `flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg text-white transition-all duration-300 ${colors[type]}`
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <span class="font-medium">${message}</span>
  `
  
  container.appendChild(toast)
  
  // Fade in
  setTimeout(() => {
    toast.style.opacity = '1'
    toast.style.transform = 'translateX(0)'
  }, 10)
  
  // Fade out and remove
  setTimeout(() => {
    toast.style.opacity = '0'
    toast.style.transform = 'translateX(100%)'
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast)
      }
    }, 300)
  }, duration)
}
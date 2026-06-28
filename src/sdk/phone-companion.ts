export function showCompanionReady(): void {
  const root = document.getElementById('companion')
  if (root) root.classList.add('glasses-live')
}

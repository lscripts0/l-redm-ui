export function faClass(icon: string): string {
  return icon.includes('fa-') ? icon : `fa-solid fa-${icon}`
}

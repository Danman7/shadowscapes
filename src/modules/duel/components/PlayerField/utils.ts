export const getTestId = (
  isOnTop: boolean,
  topId: string,
  bottomId: string,
) => {
  return isOnTop ? topId : bottomId
}

export const getCardOrigin = (isOnTop: boolean, defaultOrigin = 'top left') => {
  if (defaultOrigin === 'top center') return 'top center'
  return isOnTop ? 'bottom left' : 'top left'
}

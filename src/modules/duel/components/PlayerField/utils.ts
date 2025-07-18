export const getTestId = (
  isOnTop: boolean,
  topId: string,
  bottomId: string,
) => {
  return isOnTop ? topId : bottomId
}

export const getCardOrigin = (isOnTop: boolean) =>
  isOnTop ? 'bottom left' : 'top left'

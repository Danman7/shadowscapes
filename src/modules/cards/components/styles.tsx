import styled from 'styled-components'

import { CharacterRole } from 'src/modules/cards/types'

export const CardHeader = styled.div<{ $background: string }>`
  width: 100%;
  border-radius: ${({ theme }) => theme.spacing}px;
  background: ${({ $background }) => $background};
  color: ${({ theme }) => theme.colors.background};
  overflow: hidden;
  flex-shrink: 0;
`

export const CardTitle = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing}px;
`

export const CardCategories = styled.div<{ $isElite?: boolean }>`
  font-style: italic;
  text-align: center;
  background: ${({ $isElite, theme }) =>
    $isElite ? theme.colors.elite : theme.colors.text};
  padding: 0 ${({ theme }) => `${theme.spacing}px ${theme.spacing / 2}px`};
`

export const CardBody = styled.div`
  flex: 1 1 auto;
  padding: ${({ theme }) => theme.spacing}px 0;
  text-align: center;
  overflow-y: auto;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    display: none;
  }

  -ms-overflow-style: none;
  scrollbar-width: none;

  min-height: 0;
`

export const CardFooter = styled.div<{ $isElite?: boolean }>`
  background: ${({ $isElite, theme }) =>
    $isElite ? theme.colors.elite : theme.colors.text};
  padding: ${({ theme }) => theme.spacing}px;
  color: ${({ theme }) => theme.colors.background};
  border-radius: ${({ theme }) => theme.spacing}px;
  display: flex;
  justify-content: space-between;
`

export const FlavorText = styled.small`
  display: inline-block;
  color: ${({ theme }) => theme.colors.elite};
  font-style: italic;
  line-height: 1.4;
`

export const CardFront = styled.div<{
  $factionColor: string
  $isHidden?: boolean
  $role?: CharacterRole
}>`
  width: ${({ theme }) => theme.card.width}px;
  height: ${({ theme }) => theme.card.height}px;
  border-radius: ${({ theme }) => theme.spacing}px;
  box-shadow: ${({ theme }) => theme.boxShadow.level1};
  background-color: ${({ $isHidden, theme }) =>
    $isHidden ? theme.colors.hidden : theme.colors.surface};
  border-width: 1px;
  border-style: solid;
  border-color: rgba(0, 0, 0, 0.1);
  padding: ${({ theme }) => theme.spacing}px;
  display: flex;
  flex-direction: column;

  ${({ $isHidden, $role, $factionColor }) => {
    if ($isHidden)
      return `
      border-style: dashed;
    `

    if ($role === 'fighter')
      return `
      border-color: ${$factionColor};
    `

    if ($role === 'agent')
      return `
      border-style: dotted;
      border-color: ${$factionColor};
    `
  }}
`

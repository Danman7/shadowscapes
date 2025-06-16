import { Crater, Light, Moon } from 'src/components/styles'

export const MoonLoading: React.FC = () => (
  <Moon>
    <Light />
    <Crater $size="0.25em" $top="0.25em" $left="0.65em" />
    <Crater $size="0.15em" $top="0.09em" $left="0.51em" />
    <Crater $size="0.12em" $top="0.2em" $left="0.2em" />
    <Crater $size="0.2em" $top="0.5em" $left="0.3em" />
    <Crater $size="0.05em" $top="0.3em" $left="0.35em" />
    <Crater $size="0.05em" $top="0.7em" $left="0.7em" />
  </Moon>
)

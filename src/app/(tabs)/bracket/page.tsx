import dataProvider from '@/lib/dataProvider'
import BracketClient from './BracketClient'

export default function BracketPage() {
  const bracket = dataProvider.getBracket()
  return <BracketClient bracket={bracket} />
}

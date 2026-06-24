import dataProvider from '@/lib/dataProvider'
import BracketClient from './BracketClient'

export default function BracketPage() {
  const initialMatches = dataProvider.getMatches()
  return <BracketClient initialMatches={initialMatches} />
}

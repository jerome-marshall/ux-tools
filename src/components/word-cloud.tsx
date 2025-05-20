'use client'

import { forwardRef, useCallback, useMemo } from 'react'
import WordCloudD3 from 'react-d3-cloud'

type Word = { text: string; value: number }

type Props =
  | {
      words: Word[]
    }
  | {
      text: string
    }

const MAX_FONT_SIZE = 200
const MIN_FONT_SIZE = 30
const MAX_FONT_WEIGHT = 700
const MIN_FONT_WEIGHT = 400
const MAX_WORDS = 150

export const WordCloud = forwardRef<HTMLDivElement, Props>((props, ref) => {
  const words = useMemo(() => {
    if ('words' in props) {
      return props.words
    } else {
      const tokens = getTokens(props.text)
      const wordCounts = tokens.reduce(
        (acc, token) => {
          acc[token] = (acc[token] ?? 0) + 1
          return acc
        },
        {} as Record<string, number>
      )

      return Object.entries(wordCounts).map(([text, value]) => ({ text, value }))
    }
  }, [props])

  const sortedWords = useMemo(
    () => words.sort((a, b) => b.value - a.value).slice(0, MAX_WORDS),
    [words]
  )

  const [minOccurences, maxOccurences] = useMemo(() => {
    const min = Math.min(...sortedWords.map(w => w.value))
    const max = Math.max(...sortedWords.map(w => w.value))
    return [min, max]
  }, [sortedWords])

  const calculateFontSize = useCallback(
    (wordOccurrences: number) => {
      if (maxOccurences === minOccurences) return MIN_FONT_SIZE

      const normalizedValue =
        (wordOccurrences - minOccurences) / (maxOccurences - minOccurences)
      const fontSize = MIN_FONT_SIZE + normalizedValue * (MAX_FONT_SIZE - MIN_FONT_SIZE)
      return Math.round(fontSize)
    },
    [maxOccurences, minOccurences]
  )

  const calculateFontWeight = useCallback(
    (wordOccurrences: number) => {
      if (maxOccurences === minOccurences) return MIN_FONT_WEIGHT

      const normalizedValue =
        (wordOccurrences - minOccurences) / (maxOccurences - minOccurences)
      const fontWeight =
        MIN_FONT_WEIGHT + normalizedValue * (MAX_FONT_WEIGHT - MIN_FONT_WEIGHT)
      return Math.round(fontWeight)
    },
    [maxOccurences, minOccurences]
  )

  return (
    <div ref={ref} className='h-full w-full'>
      <WordCloudD3
        height={800}
        width={1200}
        font={'Poppins'}
        fontWeight={word => calculateFontWeight(word.value)}
        data={sortedWords}
        rotate={0}
        padding={1}
        fontSize={word => calculateFontSize(word.value)}
        random={() => 0.5}
      />
    </div>
  )
})

WordCloud.displayName = 'WordCloud'

// English stopwords list for client-side usage
const ENGLISH_STOPWORDS = new Set([
  'i',
  'me',
  'my',
  'myself',
  'we',
  'our',
  'ours',
  'ourselves',
  'you',
  'your',
  'yours',
  'yourself',
  'yourselves',
  'he',
  'him',
  'his',
  'himself',
  'she',
  'her',
  'hers',
  'herself',
  'it',
  'its',
  'itself',
  'they',
  'them',
  'their',
  'theirs',
  'themselves',
  'what',
  'which',
  'who',
  'whom',
  'this',
  'that',
  'these',
  'those',
  'am',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'having',
  'do',
  'does',
  'did',
  'doing',
  'a',
  'an',
  'the',
  'and',
  'but',
  'if',
  'or',
  'because',
  'as',
  'until',
  'while',
  'of',
  'at',
  'by',
  'for',
  'with',
  'about',
  'against',
  'between',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'to',
  'from',
  'up',
  'down',
  'in',
  'out',
  'on',
  'off',
  'over',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'any',
  'both',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  's',
  't',
  'can',
  'will',
  'just',
  'don',
  'should',
  'now'
])

export const getTokens = (text: string): string[] => {
  const lowerText = text.toLowerCase().replace(/[^\w\s]/g, '')
  return lowerText
    .split(/\s+/)
    .filter(token => token.length > 1 && !ENGLISH_STOPWORDS.has(token))
}

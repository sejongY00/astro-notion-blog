import type { Block } from './interfaces.ts'
import { getAllBlocksByBlockId } from './notion/client.ts'

// 글 목록 페이지마다 같은 글의 블록을 다시 받아오지 않도록 빌드 동안 결과를 기억한다.
const readingTimeCache = new Map<string, Promise<number>>()

const collectText = (value: unknown, words: string[], images: { n: number }) => {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) {
    value.forEach((v) => collectText(v, words, images))
    return
  }
  const obj = value as Record<string, unknown>
  if (obj.Type === 'image') images.n++
  if (typeof obj.PlainText === 'string') {
    words.push(obj.PlainText)
    return
  }
  Object.values(obj).forEach((v) => collectText(v, words, images))
}

// Ghost와 같은 방식: 단어 수를 분당 275단어로 나누고,
// 이미지마다 12초부터 1초씩 줄여(최소 3초) 더한다.
export const getReadingMinutes = (pageId: string): Promise<number> => {
  if (!readingTimeCache.has(pageId)) {
    readingTimeCache.set(
      pageId,
      getAllBlocksByBlockId(pageId).then((blocks: Block[]) => {
        const words: string[] = []
        const images = { n: 0 }
        collectText(blocks, words, images)
        // 한글은 글자 하나를 한 단어로 센다 (Ghost와 같은 방식).
        const text = words.join(' ')
        const hangul = (text.match(/[가-힣]/g) || []).length
        const others = text.replace(/[가-힣]/g, ' ').split(/\s+/).filter(Boolean).length
        const wordCount = hangul + others
        let seconds = (wordCount / 275) * 60
        for (let i = 0; i < images.n; i++) seconds += Math.max(12 - i, 3)
        return Math.max(1, Math.round(seconds / 60))
      })
    )
  }
  return readingTimeCache.get(pageId)!
}

export const getKoreanDate = (date: string) => {
  const [y, m, d] = date.slice(0, 10).split('-').map((v) => parseInt(v, 10))
  return `${y}년 ${m}월 ${d}일`
}

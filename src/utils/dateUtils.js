/**
 * 日本時間（JST）関連のユーティリティ関数
 */

/**
 * 日本語形式またはスラッシュ形式の日時文字列をISO 8601形式（UTC）に変換
 * 例: "2025/10/15 14:28" -> "2025-10-15T05:28:00Z"
 * 例: "2025年10月15日14時28分" -> "2025-10-15T05:28:00Z"
 *
 * @param {string} jpText - 日本語形式またはスラッシュ形式の日時文字列
 * @returns {string|null} - ISO 8601形式の文字列（UTC）、変換できない場合はnull
 */
export const parseJapaneseToISO = (jpText) => {
  if (!jpText || jpText.trim() === '') return null

  const raw = jpText.trim()

  // "2025/10/15 14:28" 形式（スラッシュ形式）
  const slash1 = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/)
  if (slash1) {
    const yyyy = slash1[1]
    const mm = String(slash1[2]).padStart(2, '0')
    const dd = String(slash1[3]).padStart(2, '0')
    const hh = String(slash1[4]).padStart(2, '0')
    const mi = String(slash1[5]).padStart(2, '0')

    // 日本時間として解釈し、UTCに変換
    const jstDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00+09:00`)
    return jstDate.toISOString()
  }

  // "2025年10月15日14時28分" 形式
  const jp1 = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時(\d{1,2})分$/)
  if (jp1) {
    const yyyy = jp1[1]
    const mm = String(jp1[2]).padStart(2, '0')
    const dd = String(jp1[3]).padStart(2, '0')
    const hh = String(jp1[4]).padStart(2, '0')
    const mi = String(jp1[5]).padStart(2, '0')

    // 日本時間として解釈し、UTCに変換
    const jstDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00+09:00`)
    return jstDate.toISOString()
  }

  // "2025年10月15日14時" 形式
  const jp2 = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時$/)
  if (jp2) {
    const yyyy = jp2[1]
    const mm = String(jp2[2]).padStart(2, '0')
    const dd = String(jp2[3]).padStart(2, '0')
    const hh = String(jp2[4]).padStart(2, '0')

    // 日本時間として解釈し、UTCに変換
    const jstDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:00:00+09:00`)
    return jstDate.toISOString()
  }

  // "2025-10-15-14:28:00" 形式（古い形式との互換性）
  const m1 = raw.match(/^(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})$/)
  if (m1) {
    const jstDate = new Date(`${m1[1]}T${m1[2]}+09:00`)
    return jstDate.toISOString()
  }

  // すでにISO形式の場合はそのまま返す
  if (raw.includes('T') && raw.includes('Z')) {
    return raw
  }

  return null
}

/**
 * ISO 8601形式（UTC）をスラッシュ形式（JST）に変換
 * 例: "2025-10-15T05:28:00Z" -> "2025/10/15 14:28"
 *
 * @param {string} iso - ISO 8601形式の文字列（UTC）
 * @returns {string} - スラッシュ形式の文字列（YYYY/MM/DD H:MM）
 */
export const formatISOToJapanese = (iso) => {
  if (!iso) return ''

  try {
    // ISO文字列をDateオブジェクトに変換
    const date = new Date(iso)

    // 日本時間に変換（UTC+9）
    const jstDate = new Date(date.getTime() + 9 * 60 * 60 * 1000)

    const year = jstDate.getUTCFullYear()
    const month = jstDate.getUTCMonth() + 1
    const day = jstDate.getUTCDate()
    const hours = jstDate.getUTCHours()
    const minutes = jstDate.getUTCMinutes()

    // YYYY/MM/DD H:MM 形式で返す（先頭ゼロなし）
    return `${year}/${month}/${day} ${hours}:${minutes === 0 ? '00' : String(minutes).padStart(2, '0')}`
  } catch (error) {
    console.error('Failed to format ISO to slash format:', error)
    return iso
  }
}

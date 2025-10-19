// 入力テキスト（スラッシュ形式、日本語表記や旧形式、ISO風）から ISO 8601 文字列(UTC, Z) もしくは null を返す
// 日本時間（JST）として入力された時刻をUTCに変換してDBに保存する
// - スラッシュ形式: YYYY/M/D H:MM    → YYYY-MM-DDTHH:MM:00Z (JSTをUTCに変換)
// - 日本語形式: YYYY年M月D日H時M分 → YYYY-MM-DDTHH:MM:00Z (JSTをUTCに変換)
// - 日本語形式: YYYY年M月D日H時     → YYYY-MM-DDTHH:00:00Z (JSTをUTCに変換)
// - 旧形式:     YYYY-MM-DD-hh:mm:ss  → YYYY-MM-DDThh:mm:ssZ (JSTとして扱い変換)
// - それ以外:  空や不正は null
export const parseLimitText = (text) => {
  const raw = (text || '').trim()
  if (raw === '') return null

  // スラッシュ形式: YYYY/M/D H:MM
  const slash1 = raw.match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})\s+(\d{1,2}):(\d{1,2})$/)
  if (slash1) {
    const yyyy = slash1[1]
    const mm = String(slash1[2]).padStart(2, '0')
    const dd = String(slash1[3]).padStart(2, '0')
    const hh = String(slash1[4]).padStart(2, '0')
    const mi = String(slash1[5]).padStart(2, '0')

    // 日本時間（JST: UTC+9）として解釈し、UTCに変換
    const jstDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00+09:00`)
    return jstDate.toISOString()
  }

  // 日本語形式: YYYY年M月D日H時M分
  const jp1 = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時(\d{1,2})分$/)
  if (jp1) {
    const yyyy = jp1[1]
    const mm = String(jp1[2]).padStart(2, '0')
    const dd = String(jp1[3]).padStart(2, '0')
    const hh = String(jp1[4]).padStart(2, '0')
    const mi = String(jp1[5]).padStart(2, '0')

    // 日本時間（JST: UTC+9）として解釈し、UTCに変換
    const jstDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:${mi}:00+09:00`)
    return jstDate.toISOString()
  }

  // 日本語形式: YYYY年M月D日H時
  const jp2 = raw.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日(\d{1,2})時$/)
  if (jp2) {
    const yyyy = jp2[1]
    const mm = String(jp2[2]).padStart(2, '0')
    const dd = String(jp2[3]).padStart(2, '0')
    const hh = String(jp2[4]).padStart(2, '0')

    // 日本時間（JST: UTC+9）として解釈し、UTCに変換
    const jstDate = new Date(`${yyyy}-${mm}-${dd}T${hh}:00:00+09:00`)
    return jstDate.toISOString()
  }

  // 旧形式: YYYY-MM-DD-hh:mm:ss（日本時間として扱う）
  const old = raw.match(/^(\d{4}-\d{2}-\d{2})-(\d{2}:\d{2}:\d{2})$/)
  if (old) {
    const jstDate = new Date(`${old[1]}T${old[2]}+09:00`)
    return jstDate.toISOString()
  }

  // ISO風（既に ISO 8601 の可能性がある場合）は最低限の検証だけして受け入れる
  // 例: 2025-01-02T03:04:05Z または 2025-01-02T03:04:00Z
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(raw)) {
    return raw
  }

  return null
}

export default parseLimitText



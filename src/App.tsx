import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, Download, Trash2, Plus, User, Copy } from 'lucide-react'
import { TimeCardEntry } from './types'

function App() {
  const [entries, setEntries] = useState<TimeCardEntry[]>([])
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [staffName, setStaffName] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [hourlyWage, setHourlyWage] = useState<number>(1000)

  // LocalStorageからデータを読み込む
  useEffect(() => {
    const savedEntries = localStorage.getItem('timecardEntries')
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries))
    }
  }, [])

  // データが変更されたらLocalStorageに保存
  useEffect(() => {
    localStorage.setItem('timecardEntries', JSON.stringify(entries))
  }, [entries])

  // 勤務時間と日当を計算
  const calculatePay = (start: string, end: string, wage: number) => {
    if (!start || !end) return { workHours: 0, dailyPay: 0 }

    const [startHour, startMin] = start.split(':').map(Number)
    const [endHour, endMin] = end.split(':').map(Number)

    const startMinutes = startHour * 60 + startMin
    const endMinutes = endHour * 60 + endMin

    const workMinutes = endMinutes - startMinutes
    const workHours = workMinutes / 60
    const dailyPay = Math.round(workHours * wage)

    return { workHours, dailyPay }
  }

  // エントリーを追加
  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault()

    if (!staffName || !startTime || !endTime) {
      alert('すべての項目を入力してください')
      return
    }

    const { workHours, dailyPay } = calculatePay(startTime, endTime, hourlyWage)

    if (workHours <= 0) {
      alert('終了時間は開始時間より後にしてください')
      return
    }

    const newEntry: TimeCardEntry = {
      id: Date.now().toString(),
      date,
      staffName,
      startTime,
      endTime,
      hourlyWage,
      workHours,
      dailyPay,
    }

    setEntries([...entries, newEntry])

    // フォームをリセット
    setStaffName('')
    setStartTime('')
    setEndTime('')
  }

  // エントリーを削除
  const handleDeleteEntry = (id: string) => {
    if (window.confirm('このエントリーを削除しますか?')) {
      setEntries(entries.filter(entry => entry.id !== id))
    }
  }

  // 合計金額を計算
  const totalPay = entries.reduce((sum, entry) => sum + entry.dailyPay, 0)

  // スタッフ名ごとの集計
  const staffSummary = entries.reduce((acc, entry) => {
    if (!acc[entry.staffName]) {
      acc[entry.staffName] = {
        entries: [],
        total: 0,
      }
    }
    acc[entry.staffName].entries.push(entry)
    acc[entry.staffName].total += entry.dailyPay
    return acc
  }, {} as Record<string, { entries: TimeCardEntry[], total: number }>)

  // スタッフ名ごとの給料明細テキストを生成
  const generateStaffPaySlip = (staffName: string) => {
    const staff = staffSummary[staffName]
    if (!staff) return ''

    const sortedEntries = [...staff.entries].sort((a, b) => a.date.localeCompare(b.date))

    const lines = sortedEntries.map(entry => {
      const dateObj = new Date(entry.date + 'T00:00:00')
      const month = dateObj.getMonth() + 1
      const day = dateObj.getDate()
      return `${month}/${day}　${entry.staffName}　　${entry.startTime}〜${entry.endTime} (${entry.workHours.toFixed(1)}時間) × ${entry.hourlyWage.toLocaleString()}円 = ${entry.dailyPay.toLocaleString()}円`
    })

    lines.push('')
    lines.push(`合計: ${staff.total.toLocaleString()}円`)

    return lines.join('\n')
  }

  // クリップボードにコピー
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert('クリップボードにコピーしました')
    }).catch(() => {
      alert('コピーに失敗しました')
    })
  }

  // CSVダウンロード
  const handleDownloadCSV = () => {
    if (entries.length === 0) {
      alert('ダウンロードするデータがありません')
      return
    }

    const headers = ['日付', 'スタッフ名', '開始時間', '終了時間', '勤務時間', '時給', '日当']
    const rows = entries.map(entry => [
      entry.date,
      entry.staffName,
      entry.startTime,
      entry.endTime,
      `${entry.workHours.toFixed(2)}時間`,
      `${entry.hourlyWage}円`,
      `${entry.dailyPay}円`,
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(',')),
      '',
      `合計,,,,,, ${totalPay}円`,
    ].join('\n')

    const bom = '\uFEFF' // BOM for Excel UTF-8
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `timecard_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 px-4">
      <div className="max-w-6xl mx-auto">
        {/* ヘッダー */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 text-center mb-2">
            居酒屋タイムカード
          </h1>
          <p className="text-center text-gray-600">給与計算システム</p>
        </div>

        {/* 合計金額表示 */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-xl p-8 mb-6 text-white">
          <div className="flex items-center justify-center gap-4">
            <DollarSign className="w-12 h-12" />
            <div>
              <p className="text-lg font-semibold mb-1">総支払額</p>
              <p className="text-5xl font-bold">¥{totalPay.toLocaleString()}</p>
            </div>
          </div>
        </div>

        {/* 入力フォーム */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <Plus className="w-7 h-7" />
            新規エントリー
          </h2>

          <form onSubmit={handleAddEntry} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 日付 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar className="w-5 h-5" />
                  日付
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* スタッフ名 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  スタッフ名
                </label>
                <input
                  type="text"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                  placeholder="山田太郎"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* 開始時間 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-5 h-5" />
                  開始時間
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* 終了時間 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Clock className="w-5 h-5" />
                  終了時間
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>

              {/* 時給 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <DollarSign className="w-5 h-5" />
                  時給 (円)
                </label>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  min="0"
                  step="50"
                  className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  required
                />
              </div>
            </div>

            {/* 送信ボタン */}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-6 rounded-lg text-lg transition duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-6 h-6" />
              エントリーを追加
            </button>
          </form>
        </div>

        {/* スタッフ別給料明細 */}
        {Object.keys(staffSummary).length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-7 h-7" />
              スタッフ別給料明細
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(staffSummary).map(([staffName, data]) => (
                <div key={staffName} className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-gray-800">{staffName}</h3>
                    <button
                      onClick={() => copyToClipboard(generateStaffPaySlip(staffName))}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      コピー
                    </button>
                  </div>

                  <div className="space-y-2 mb-3">
                    {[...data.entries]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .map(entry => {
                        const dateObj = new Date(entry.date + 'T00:00:00')
                        const month = dateObj.getMonth() + 1
                        const day = dateObj.getDate()
                        return (
                          <div key={entry.id} className="text-sm text-gray-700 font-mono bg-gray-50 p-2 rounded">
                            {month}/{day} {entry.startTime}〜{entry.endTime} ({entry.workHours.toFixed(1)}h) × ¥{entry.hourlyWage.toLocaleString()} = ¥{entry.dailyPay.toLocaleString()}
                          </div>
                        )
                      })
                    }
                  </div>

                  <div className="border-t-2 border-gray-300 pt-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800">合計</span>
                      <span className="text-2xl font-bold text-green-600">¥{data.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* データ一覧 */}
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">
              勤務記録 ({entries.length}件)
            </h2>
            {entries.length > 0 && (
              <button
                onClick={handleDownloadCSV}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center gap-2 shadow-lg"
              >
                <Download className="w-5 h-5" />
                CSVダウンロード
              </button>
            )}
          </div>

          {entries.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-lg">まだデータがありません</p>
              <p className="text-sm mt-2">上のフォームから勤務記録を追加してください</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="px-4 py-3 text-left font-semibold">日付</th>
                    <th className="px-4 py-3 text-left font-semibold">スタッフ名</th>
                    <th className="px-4 py-3 text-left font-semibold">時間</th>
                    <th className="px-4 py-3 text-right font-semibold">勤務時間</th>
                    <th className="px-4 py-3 text-right font-semibold">時給</th>
                    <th className="px-4 py-3 text-right font-semibold">日当</th>
                    <th className="px-4 py-3 text-center font-semibold">削除</th>
                  </tr>
                </thead>
                <tbody>
                  {entries.map((entry, index) => (
                    <tr
                      key={entry.id}
                      className={`border-b hover:bg-gray-50 transition ${
                        index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      }`}
                    >
                      <td className="px-4 py-4 text-gray-800">{entry.date}</td>
                      <td className="px-4 py-4 text-gray-800 font-medium">{entry.staffName}</td>
                      <td className="px-4 py-4 text-gray-600">
                        {entry.startTime} ~ {entry.endTime}
                      </td>
                      <td className="px-4 py-4 text-right text-gray-800">
                        {entry.workHours.toFixed(2)}時間
                      </td>
                      <td className="px-4 py-4 text-right text-gray-800">
                        ¥{entry.hourlyWage.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-right font-bold text-green-600">
                        ¥{entry.dailyPay.toLocaleString()}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition duration-200"
                          aria-label="削除"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App

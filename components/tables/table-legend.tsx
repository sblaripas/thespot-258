export function TableLegend() {
  return (
    <div className="flex gap-4 mb-6 flex-wrap">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-green-500" />
        <span className="text-sm">Free</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-red-500" />
        <span className="text-sm">Occupied</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-yellow-500" />
        <span className="text-sm">Reserved</span>
      </div>
    </div>
  )
}

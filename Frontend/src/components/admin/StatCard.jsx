import React from 'react'

// Small, reusable "number + label" card used by both the Orders and
// Inventory analytics rows. `tone` just picks a text color so cancelled /
// out-of-stock counts can stand out without a whole new component.
const toneClasses = {
  default: 'text-gray-800',
  green: 'text-green-600',
  yellow: 'text-yellow-600',
  red: 'text-red-500',
  blue: 'text-blue-600',
}

export default function StatCard({ label, value, tone = 'default' }) {
  return (
    <div className='border border-gray-200 rounded-sm p-4 bg-white'>
      <p className='text-xs text-gray-500 uppercase tracking-wide'>{label}</p>
      <p className={`text-2xl font-medium mt-1 ${toneClasses[tone] || toneClasses.default}`}>{value}</p>
    </div>
  )
}

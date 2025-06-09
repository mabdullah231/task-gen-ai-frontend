import React from 'react'

const Loader = ({h=40}) => {
  return (
    <div className={`flex justify-center items-center h-${h}`}>
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
  </div>
  )
}

export default Loader
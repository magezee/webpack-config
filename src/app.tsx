import React from 'react'
import style from './app.scss'
import Test from 'components/Test'

import gugu from './gugu.jpg'
const App:React.FC<any> = () => {
  return (
    <div className={style.app}>
      <Test name='jack' age={24}/>
      <img src={gugu}></img>
    </div>
  )
}

export default App
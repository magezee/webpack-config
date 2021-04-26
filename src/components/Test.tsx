import React from 'react'

interface ITestProps {
  name: string
  age: number

}

const Test: React.FC<ITestProps> = ({name, age}) => (
  <div>I am{name}, {age}!!!</div>
)

export default Test
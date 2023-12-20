import { KeyboardEvent, useRef } from "react"
import { TTodoRestItem } from "./App"

type TProps = {
  todolist: TTodoRestItem[],
  setTodolist: (todolist: TTodoRestItem[]) => void
}

export default function (props: TProps) {
  const { todolist, setTodolist } = props

  const ref = useRef<HTMLLIElement>(null)
  const onKeyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const value = event.currentTarget.value
      event.currentTarget.value = ''
      const currentDate = Math.floor(Date.now() / 1000)

      const newTodolist = [{ id: -1, text: value, date: currentDate, ref }, ...todolist]
      setTodolist(newTodolist)

      const request = await fetch("http://localhost:3000/item", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todo: value })
      })
      const response = await request.json()

      if (ref.current) {
        ref.current.dataset.id = response.lastID
        ref.current.className = 'synced'
      }

    }
  }

  return <>
    <div className="container">
      <span className="material-symbols-outlined">add</span>
      <input className="input-action" placeholder="nova tarefa" type="text" onKeyDown={onKeyDown} />
    </div>
  </>
}

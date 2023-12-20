import { KeyboardEvent, MouseEvent, useEffect, useState } from "react"
import { TTodoRestItem } from "./App"

type TProps = {
  todolist: TTodoRestItem[],
  setTodolist: (todolist: TTodoRestItem[]) => void
}

export default function (props: TProps) {
  const { todolist, setTodolist } = props

  const [formattedDates, setFormattedDates] = useState<Record<number, string>>({})
  const [originalDates, setOriginalDates] = useState<Record<number, number>>({})

  useEffect(() => {
    const fetchFormattedDates = async () => {
      const formattedDatesCopy: Record<number, string> = {}
      const originalDatesCopy: Record<number, number> = {}
  
      for (const todo of todolist) {
        originalDatesCopy[todo.id] = todo.date;
        formattedDatesCopy[todo.id] = await formatUnixTimestamp(todo.date)
      }
  
      setOriginalDates(originalDatesCopy);
      setFormattedDates(formattedDatesCopy);
    };
  
    fetchFormattedDates();
  }, [todolist])

  const removeItem = async (event: MouseEvent<HTMLButtonElement>) => {
    const id = Number(event.currentTarget.dataset.id) as number
    const li = event.currentTarget.closest('li') as HTMLLIElement
    li.className = 'pending'
    await fetch(`http://localhost:3000/item/${id}`, { method: 'DELETE' })
    const newTodolist = todolist.filter((val, _key) => val.id !== id)
    setTodolist(newTodolist)
  }

  const saveChanges = async (event: MouseEvent<HTMLButtonElement>) => {
    const id = Number(event.currentTarget.dataset.id) as number
    const li = event.currentTarget.closest('li') as HTMLLIElement
    const input = li.querySelector('input') as HTMLInputElement
    li.className = 'pending'
    const value = input.value
    
    const request = await fetch(`http://localhost:3000/item/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ todo: value, date: originalDates[id] })
    })
    const response = await request.json()
    console.log(response)
    li.className = 'synced'
  }

  const keyDown = async (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const li = event.currentTarget.closest('li') as HTMLLIElement
      const saveButton = li.querySelector('button.save') as HTMLButtonElement
      saveButton.click()
      li.className = 'pending'
      const value = event.currentTarget.value
      const id = event.currentTarget.dataset.id

      const request = await fetch(`http://localhost:3000/item/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ todo: value, date: originalDates[Number(id)] })
      })
      const response = await request.json()
      console.log(response)
      li.className = 'synced'
    }
  }

  const formatUnixTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp)
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    return `${day}/${month}/${year}, ${hours}:${minutes}:${seconds}`
  };

  const [isTextStriked, setIsTextStriked] = useState<Record<number, boolean>>({})

  const toggleTextStrike = (id: number) => {
    setIsTextStriked((prev) => {
      const newMap = { ...prev };
      newMap[id] = !prev[id];
      return newMap;
    });
  };

  return <>
  <div className="container-list">
    <ul>
      {todolist.map((todo, _key) =>
        <li ref={todo.ref} key={todo.id} data-id={todo.id} className={todo.id < 0 ? "pending" : "synced"}>
          <input data-id={todo.id} defaultValue={todo.text} onKeyDown={keyDown} className={isTextStriked[todo.id] ? "strikethrough" : ""} />
          <button data-id={todo.id} onClick={saveChanges}><i className="fa fa-save"></i></button>
          <button data-id={todo.id} onClick={removeItem}><i className="fa fa-trash"></i></button>
          <span className={`data-in ${isTextStriked[todo.id] ? "strikethrough" : ""}`}>{formattedDates[todo.id]}</span>
          
          <label className="switch">
            <div className="switch-wrapper">
              <input type="checkbox" className="checkbox" onChange={() => toggleTextStrike(todo.id)} checked={isTextStriked[todo.id]} />
              <span className="switch-btn"></span>
            </div>
          </label>

        </li>
      )}
    </ul>
  </div>
  </>
}

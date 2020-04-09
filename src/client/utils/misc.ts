export function blankify(str: string) {
  return str.replace(/BLANK/gm, '______')
}

// modifies in places
export function swap(list: any[], a: number, b: number) {
  ;[list[a], list[b]] = [list[b], list[a]]
}

export function shuffle<T>(_list: T[]) {
  const list = [..._list]
  let i = list.length
  while (--i) {
    swap(list, i, ~~(Math.random() * i))
  }

  return list
}

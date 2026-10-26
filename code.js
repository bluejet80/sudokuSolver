const SIZE = 9
const board = document.querySelector("#board")
const status = document.querySelector("#status")

const cells = []
let selectedCell = null

//draw all cells
for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
        const index = row * SIZE + col
        const cell = document.createElement("div")
        cell.className = "cell"

        const input = document.createElement("input")
        input.type = "text"
        input.inputMode = "numeric"
        input.maxLength = 1
        input.autocomplete = "off"
        

        const candidates = document.createElement("div")
        candidates.className = "candidates"

        for (let n = 1; n <= 9; n++) {
            const candidate = document.createElement("span")
            candidate.textContent = n
            candidate.dataset.number = n

            candidate.addEventListener("click", () => {
                if(!cell.classList.contains("filled")) {
                    input.value = n
                    updateBoard()
                    input.focus()
                }
            })

            candidates.appendChild(candidate)
        }
        
        input.addEventListener("focus", () => {
            selectedCell = index
        })

        input.addEventListener("input", () => {
            const value = input.value.replace(/[^1-9]/g, "")
            input.value = value.slice(-1)
            updateBoard()
        })

        input.addEventListener("keydown", event => {
            if (event.key === "ArrowUp") move(-9, event)
            if (event.key === "ArrowDown") move(9, event)
            if (event.key === "ArrowLeft") move(-1, event)
            if (event.key === "ArrowRight") move(1, event)
        })
        
        cell.append(input, candidates)
        board.appendChild(cell)

        cells.push({
            row,
            col,
            cell,
            input,
            candidates
        })

        }
    }

function move(offset, event) {
    event.preventDefault()

    const next = Math.max(0, Math.min(80, selectedCell + offset))
    cells[next].input.focus()
}


//Return the numbers already used in this cell's peers
function getUsedNumbers(row, col) {
    const used = new Set()

    for (let i = 0; i < SIZE; i++) {
        const rowValue = cells[row * SIZE + i].input.value
        const colValue = cells[i * SIZE + col].input.value

        if (rowValue) used.add(rowValue)
        if (colValue) used.add(colValue)
    }

    const boxRow = Math.floor(row / 3) * 3
    const boxCol = Math.floor(col / 3) * 3

    for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
            const value = cells[r * SIZE + c].input.value
            if (value) used.add(value)
        }
    }

    return used
}


function updateBoard() {
    let conflicts = 0
    let filled = 0

    //First find all duplicate numbers
    const invalid = new Set()

    for (const current of cells) {
        const value = current.input.value
        if (!value) continue

        filled++

        for (const other of cells) {
            if (other === current || other.input.value !== value) {
                continue
            }

            const sameRow = current.row === other.row
            const sameCol = current.col === other.col

            const sameBox = 
                Math.floor(current.row / 3) ===
                    Math.floor(other.row / 3) &&
                Math.floor(current.col / 3) ===
                    Math.floor(other.col / 3)

            if (sameRow || sameCol || sameBox) {
                invalid.add(current)
                invalid.add(other)
            }
        }
    }

    // Then Update each cell and its candidate list
    for (const current of cells) {
        const { row, col, cell, input, candidates } = current
        const value = input.value
        const used = getUsedNumbers(row, col)

        cell.classList.toggle("filled", Boolean(value))
        cell.classList.toggle("invalid", invalid.has(current))

        for (const candidate of candidates.children) {
            const n = candidate.dataset.number

            candidate.classList.toggle("gone", Boolean(value) || used.has(n))
        }
    }

    conflicts = invalid.size

    if (conflicts) {
        status.textContent = `${conflicts} cells have conflicting numbers. `
    } else {
        status.textContent =
        `${filled}/81 cells filled. No conflicts detected.`
    }
}

document.querySelector("#reset").addEventListener("click", () => {
    for (const current of cells) {
        current.input.value = ""
    }

    updateBoard()
    cells[0].input.focus()
})

document.querySelector("#clear").addEventListener("click", () => {
    if (selectedCell === null) reutnr

    cells[selectedCell].input.value = ""
    updateBoard()
    cells[selectedCell].input.focus()
})

updateBoard()

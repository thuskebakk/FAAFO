document.addEventListener('DOMContentLoaded', () => {
    const rows = Array.from(document.querySelectorAll('.letter-row'));
    let currentRow = 0;
    let currentBox = 0;

    // Make all h3s editable and set up event listeners
    rows.forEach((row, rowIndex) => {
        const boxes = Array.from(row.querySelectorAll('.letter-box h3'));
        boxes.forEach((h3, boxIndex) => {
            h3.setAttribute('contenteditable', rowIndex === 0 ? 'true' : 'false');
            h3.addEventListener('keydown', (e) => handleKey(e, rowIndex, boxIndex));
            h3.addEventListener('input', () => {
                // Only allow one character
                if (h3.innerText.length > 1) {
                    h3.innerText = h3.innerText[0];
                    setCaretToEnd(h3);
                }
            });
        });
    });

    function handleKey(e, rowIndex, boxIndex) {
        const boxes = Array.from(rows[rowIndex].querySelectorAll('.letter-box h3'));
        if (e.key === 'Backspace') {
            if (boxes[boxIndex].innerText === '') {
                if (boxIndex > 0) {
                    boxes[boxIndex - 1].innerText = '';
                    boxes[boxIndex - 1].focus();
                    setCaretToEnd(boxes[boxIndex - 1]);
                }
            } else {
                boxes[boxIndex].innerText = '';
            }
            e.preventDefault();
            return;
        }
        if (e.key === 'Enter') {
            if (rowIndex === currentRow && isRowFull(boxes)) {
                // Move to next row if exists
                if (rows[currentRow + 1]) {
                    setRowEditable(currentRow, false);
                    currentRow++;
                    currentBox = 0;
                    setRowEditable(currentRow, true);
                    rows[currentRow].querySelectorAll('.letter-box h3')[0].focus();
                }
            }
            e.preventDefault();
            return;
        }
        if (e.key.length === 1 && /^[a-zA-ZÆØÅæøå]$/.test(e.key)) {
            // Only allow input if not full
            if (rowIndex === currentRow && !isRowFull(boxes)) {
                boxes[boxIndex].innerText = e.key.toUpperCase();
                boxes[boxIndex].classList.remove('letter-jump'); // Remove if already present
                // Force reflow to restart animation
                void boxes[boxIndex].offsetWidth;
                boxes[boxIndex].classList.add('letter-jump');
                setCaretToEnd(boxes[boxIndex]);
                e.preventDefault();
                // Move to next box if not last
                if (boxIndex < boxes.length - 1) {
                    boxes[boxIndex + 1].focus();
                    setCaretToEnd(boxes[boxIndex + 1]);
                }
            } else {
                e.preventDefault();
            }
        } else if (e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
            // Prevent all other keys except navigation
            e.preventDefault();
        }
    }

    function isRowFull(boxes) {
        return boxes.every(h3 => h3.innerText.length === 1);
    }

    function setRowEditable(rowIdx, editable) {
        const boxes = Array.from(rows[rowIdx].querySelectorAll('.letter-box h3'));
        boxes.forEach(h3 => h3.setAttribute('contenteditable', editable ? 'true' : 'false'));
    }

    function setCaretToEnd(el) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(el);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }

    // Autofocus first box
    rows[0].querySelector('.letter-box h3').focus();
});
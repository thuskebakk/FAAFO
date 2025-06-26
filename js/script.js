document.addEventListener('DOMContentLoaded', () => {
    const rows = Array.from(document.querySelectorAll('.letter-row'));
    let currentRow = 0;
    let wordList = [];
    let correctWord = '';

    fetch('content/5_letter_words.txt')
        .then(res => res.text())
        .then(text => {
            wordList = text.split('\n')
                .map(word => word.replace(/\r/g, '').trim().toUpperCase())
                .filter(word => word.length === 5);
            correctWord = wordList[Math.floor(Math.random() * wordList.length)];

            // Now that wordList is loaded, set up the game:
            rows.forEach((row, rowIndex) => {
                const boxes = Array.from(row.querySelectorAll('.letter-box h3'));
                boxes.forEach((h3, boxIndex) => {
                    h3.setAttribute('contenteditable', rowIndex === 0 ? 'true' : 'false');
                    h3.addEventListener('keydown', (e) => handleKey(e, rowIndex, boxIndex));
                    h3.addEventListener('input', () => {
                        if (h3.innerText.length > 1) {
                            h3.innerText = h3.innerText[0];
                            setCaretToEnd(h3);
                        }
                    });
                });
            });

            // Autofocus first box
            rows[0].querySelector('.letter-box h3').focus();

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
                        const guess = boxes.map(h3 => h3.innerText).join('').toUpperCase();
                        if (!wordList.includes(guess)) {
                            boxes.forEach(h3 => {
                                h3.style.backgroundColor = '#8b0000';
                                setTimeout(() => h3.style.backgroundColor = '#131313', 350);
                            });
                            e.preventDefault();
                            return;
                        }
                        colorBoxes(boxes, guess, correctWord);
                        if (guess === correctWord) {
                            setRowEditable(currentRow, false);
                            return;
                        }
                        if (rows[currentRow + 1]) {
                            setRowEditable(currentRow, false);
                            currentRow++;
                            setRowEditable(currentRow, true);
                            rows[currentRow].querySelectorAll('.letter-box h3')[0].focus();
                        }
                    }
                    e.preventDefault();
                    return;
                }
                if (e.key.length === 1 && /^[a-zA-ZÆØÅæøå]$/.test(e.key)) {
                    if (rowIndex === currentRow && !isRowFull(boxes)) {
                        boxes[boxIndex].innerText = e.key.toUpperCase();
                        boxes[boxIndex].classList.remove('letter-jump');
                        void boxes[boxIndex].offsetWidth;
                        boxes[boxIndex].classList.add('letter-jump');
                        setCaretToEnd(boxes[boxIndex]);
                        e.preventDefault();
                        if (boxIndex < boxes.length - 1) {
                            boxes[boxIndex + 1].focus();
                            setCaretToEnd(boxes[boxIndex + 1]);
                        }
                    } else {
                        e.preventDefault();
                    }
                } else if (e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
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

            function colorBoxes(boxes, guess, correct) {
                // Reset all backgrounds and borders on the parent .letter-box
                boxes.forEach(h3 => {
                    h3.parentElement.style.backgroundColor = '#000000';
                    h3.parentElement.style.borderColor = '#575757';
                });
                const correctArr = correct.split('');
                const guessArr = guess.split('');
                const used = Array(5).fill(false);

                // 1. Mark correct positions (lime green)
                for (let i = 0; i < 5; i++) {
                    if (guessArr[i] === correctArr[i]) {
                        boxes[i].parentElement.style.backgroundColor = 'limegreen';
                        boxes[i].parentElement.style.borderColor = 'limegreen';
                        used[i] = true;
                    }
                }
                // 2. Mark present but wrong position (mustard yellow)
                for (let i = 0; i < 5; i++) {
                    if (boxes[i].parentElement.style.backgroundColor !== 'limegreen') {
                        let found = false;
                        for (let j = 0; j < 5; j++) {
                            if (!used[j] && guessArr[i] === correctArr[j]) {
                                boxes[i].parentElement.style.backgroundColor = '#FFD600';
                                boxes[i].parentElement.style.borderColor = '#FFD600';
                                used[j] = true;
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            boxes[i].parentElement.style.backgroundColor = '#222';
                            boxes[i].parentElement.style.borderColor = '#222';
                        }
                    }
                }
            }
        });
});
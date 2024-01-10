import React, { useState, useEffect } from 'react';
import './App.css';

import buttonSound from './button.mp3';
import backgroundMusic from './halloween-music.mp3';

// Определение компонента StartScreen, который принимает пропс onStartClick
// Вызывается функция onClick, предоставленная через пропс, когда кнопка "Play" нажата
function StartScreen({ onStartClick }) {
  return (
    <div className="container">
      <h1>Halloween Tic-Tac-Toe</h1>
      <button className="start-button" onClick={onStartClick}> 
        Play
      </button>
    </div>
  );
}

// Определение компонента GridCell, который принимает пропсы value, onClick, gameEnded и playSound
function GridCell({ value, onClick, gameEnded, playSound }) {
  // Обработчик клика на клетке
  const handleClick = () => {
    // Проверка, окончена ли игра (gameEnded)
    if (!gameEnded) {
      // Если игра не окончена, вызываем функцию onClick для обработки клика
      onClick();
      // Затем вызываем функцию playSound для воспроизведения звука
      playSound();
    }
  };

  return (
    // Рендеринг клетки
    <div className={`square ${gameEnded ? 'inactive' : ''}`} onClick={handleClick}>
      {value}
    </div>
  );
}

function App() {
  // Создаем начальное состояние для игры
  const grid = Array(9).fill(null);
  const [cells, setCells] = useState(grid); // Храним состояние ячеек
  const [xIsNext, setXIsNext] = useState(true); // Определяем, чей ход (true - крестики, false - нолики)
  const [gameStarted, setGameStarted] = useState(false); // Определяем, начата ли игра
  const [gameEnded, setGameEnded] = useState(false); // Определяем, завершена ли игра
  const [winner, setWinner] = useState(null); // Определяем, есть ли победитель
  const [isMusicOn, setIsMusicOn] = useState(true); // Состояние для управления музыкой

  const playSound = () => {
    const audio = new Audio(buttonSound); // Создаем звуковой объект для звука кнопки
    audio.play(); // Воспроизводим звук
  };

  const toggleMusic = () => {
    setIsMusicOn(!isMusicOn); // Переключаем состояние музыки
  };

  // Отслеживаем изменение состояния gameStarted и isMusicOn
  useEffect(() => {
    const backgroundMusicAudio = new Audio(backgroundMusic); // Создаем объект для фоновой музыки
    backgroundMusicAudio.loop = true; // Зацикливаем музыку

    const playBackgroundMusic = () => {
      if (gameStarted && isMusicOn) {
        backgroundMusicAudio.play(); // Воспроизводим музыку, если игра начата и музыка включена
      } else {
        backgroundMusicAudio.pause(); // Иначе приостанавливаем воспроизведение
      }
    };

    playBackgroundMusic(); // Вызываем функцию воспроизведения фоновой музыки

    return () => {
      backgroundMusicAudio.pause(); // Останавливаем музыку при размонтировании компонента
    };
  }, [gameStarted, isMusicOn]);

  // Обработчик клика на клетке доски
  const handleClick = (index) => {
    // Проверяем, пуста ли клетка (cells[index] === null) и не окончена ли игра (!gameEnded)
    if (cells[index] === null && !gameEnded) {
      // Если условие выполняется, создаем новый массив newCells на основе текущего состояния cells
      const newCells = [...cells];
      // Устанавливаем в выбранной клетке '🦴' или '💀', в зависимости от текущего игрока (xIsNext)
      newCells[index] = xIsNext ? '🦴' : '💀';
      // Обновляем состояние ячеек с новым массивом
      setCells(newCells);
      // Переключаем текущего игрока (если xIsNext было true, теперь делаем false, и наоборот)
      setXIsNext(!xIsNext);
    }
  };

  // Отслеживаем изменение состояния cells (ячейки)
  useEffect(() => {
    const winner = calculateWinner(cells); // Проверяем наличие победителя
    if (winner) {
      setWinner(winner); // Устанавливаем победителя
      setGameEnded(true); // Завершаем игру
    } else if (cells.every((cell) => cell !== null)) {
      setGameEnded(true); // Если все ячейки заполнены и нет победителя, то игра заканчивается в ничью
    }
  }, [cells]);

  const resetGame = () => {
    setCells(grid); // Сбрасываем состояние ячеек
    setXIsNext(true); // Устанавливаем начинающего игрока (крестики)
    setWinner(null); // Сбрасываем победителя
    setGameEnded(false); // Сбрасываем флаг окончания игры
  };

  const startGame = () => {
    setGameStarted(true); // Устанавливаем флаг начала игры
  };
  
  // Вернуть JSX код для отображения игры
  return (
    <div className={`container ${gameStarted ? 'halloween' : ''} no-select`}>
      {gameStarted ? ( // Если игра началась
        <>
          <div className="board">
            {cells.map((value, index) => (
              <GridCell
                key={index}
                value={value}
                onClick={() => handleClick(index)} // Передаем функцию обработки клика на клетку
                playSound={playSound}
                gameEnded={gameEnded}
              />
            ))}
          </div>
          <div className="status">
            {winner ? `Winner: ${winner}` : gameEnded ? 'Draw' : `Next player: ${xIsNext ? '🦴' : '💀'}`}
          </div>
          <div className="button-container">
            <button className="button" onClick={resetGame}>
              Reset Game
            </button>
            <div className="music-control" onClick={toggleMusic} style={{ cursor: 'pointer' }}>
              {isMusicOn ? '🔊' : '🔇'}
            </div>
          </div>
        </>
      ) : (
        // Если игра еще не началась, показать стартовый экран
        <StartScreen onStartClick={startGame} />
      )}
    </div>
  );
}

// Функция для определения победителя
function calculateWinner(cells) {
  // Все возможные комбинации победных линий на доске
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];

  // Поиск победной линии
  const winningLine = lines.find(([a, b, c]) => cells[a] && cells[a] === cells[b] && cells[a] === cells[c]);

  // Если найдена победная линия, возвращаем символ победителя (X или O)
  return winningLine ? cells[winningLine[0]] : null;
}

export default App;

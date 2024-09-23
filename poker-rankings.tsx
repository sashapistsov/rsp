import { useState, useEffect } from 'react'
import { ChevronLeft, Home, BarChart2, Users, PlusCircle, ChevronDown, Check, Trash2, Edit } from 'lucide-react'

interface Player {
  name: string
  games: number
  balance: number
}

interface Game {
  id: number
  type: string
  date: string
  players: { name: string; balance: number }[]
  totalValue: number
}

function SplashScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onFinish, 3000) // Show splash screen for 3 seconds
    return () => clearTimeout(timer)
  }, [onFinish])

  return (
    <div className="fixed inset-0 bg-gray-100 flex items-center justify-center">
      <div className="w-64 h-64 relative">
        <img
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Screenshot%202024-09-23%20at%2021.34.56-1HONxtS85t5nbwWQ3cFgA8z15zI5sQ.png"
          alt="The Royal Straight Poker Club"
          className="w-full h-full object-contain"
        />
        <div className="absolute bottom-0 left-0 right-0 flex justify-center">
          <div className="animate-pulse bg-blue-500 h-2 w-16 rounded-full"></div>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-green-100">
          <Check className="w-8 h-8 text-green-500" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">Success!</h2>
        <p className="text-gray-600">Your game has been added successfully.</p>
      </div>
    </div>
  )
}

function NewGameForm({ onAddGame, onClose, editGame = null }: { onAddGame: (game: Game) => void; onClose: () => void; editGame?: Game | null }) {
  const [gameType, setGameType] = useState(editGame?.type || 'Cash Game')
  const [players, setPlayers] = useState<{ name: string; balance: number }[]>(
    editGame?.players || Array(5).fill({ name: '', balance: 0 })
  )
  const [showSuccess, setShowSuccess] = useState(false)

  const calculateTotalExchanged = () => players.reduce((sum, player) => sum + player.balance, 0)
  const isChecksumValid = () => Math.abs(calculateTotalExchanged()) < 0.01 // Allow for small floating point errors

  const handlePlayerChange = (index: number, field: 'name' | 'balance', value: string) => {
    const newPlayers = [...players]
    newPlayers[index] = { ...newPlayers[index], [field]: field === 'balance' ? Number(value) : value }
    setPlayers(newPlayers)
  }

  const handleSubmit = () => {
    if (!isChecksumValid()) {
      alert("The total balance must equal zero.")
      return
    }
    const newGame: Game = {
      id: editGame?.id || Date.now(),
      type: gameType,
      date: editGame?.date || new Date().toLocaleDateString(),
      players: players.filter(p => p.name),
      totalValue: Math.abs(players.reduce((sum, player) => sum + Math.abs(player.balance), 0)) / 2,
    }
    onAddGame(newGame)
    setShowSuccess(true)
  }

  if (showSuccess) {
    return <SuccessScreen onClose={onClose} />
  }

  return (
    <div className="bg-white min-h-screen">
      <header className="p-4 flex items-center">
        <button onClick={onClose} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold ml-4">{editGame ? 'Edit Game' : 'New Game'}</h1>
      </header>
      <div className="p-4">
        <div className="relative mb-4">
          <select
            value={gameType}
            onChange={(e) => setGameType(e.target.value)}
            className="w-full p-2 border rounded-md appearance-none"
          >
            <option>Cash Game</option>
            <option>Tournament</option>
          </select>
          <ChevronDown size={20} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <div className="flex justify-between mb-4">
          <div>
            <p className="text-sm text-gray-500">Total Exchanged</p>
            <p className="text-lg text-green-600">{calculateTotalExchanged()} CHF</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Checksum</p>
            <p className={`text-lg ${isChecksumValid() ? 'text-green-600' : 'text-red-600'}`}>
              {isChecksumValid() ? 'Valid' : 'Invalid'}
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-500 mb-2">Player Name</p>
          {players.map((player, index) => (
            <div key={index} className="flex mb-2">
              <input
                type="text"
                value={player.name}
                onChange={(e) => handlePlayerChange(index, 'name', e.target.value)}
                placeholder="Player Name"
                className="flex-grow p-2 border rounded-md mr-2"
              />
              <input
                type="number"
                value={player.balance}
                onChange={(e) => handlePlayerChange(index, 'balance', e.target.value)}
                placeholder="0"
                className="w-20 p-2 border rounded-md"
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white p-3 rounded-md mt-4"
        >
          {editGame ? 'Update Game' : 'Add Game'}
        </button>
      </div>
    </div>
  )
}

function RankingsScreen({ players, onClose, onAddPlayer }: { players: Player[]; onClose: () => void; onAddPlayer: () => void }) {
  const [sortBy, setSortBy] = useState<'balance' | 'games' | 'name'>('balance')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const sortedPlayers = [...players].sort((a, b) => {
    if (sortBy === 'balance') {
      return sortOrder === 'desc' ? b.balance - a.balance : a.balance - b.balance
    } else if (sortBy === 'games') {
      return sortOrder === 'desc' ? b.games - a.games : a.games - b.games
    } else {
      return sortOrder === 'desc' ? b.name.localeCompare(a.name) : a.name.localeCompare(b.name)
    }
  })

  const handleSort = (column: 'balance' | 'games' | 'name') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  return (
    <div className="bg-white min-h-screen flex flex-col">
      <header className="p-4 flex items-center justify-between border-b">
        <div className="flex items-center">
          <button onClick={onClose} className="text-gray-600 mr-4">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold">Ranking</h1>
        </div>
        <button onClick={onAddPlayer} className="text-gray-600">
          <PlusCircle size={24} />
        </button>
      </header>
      <div className="flex-grow overflow-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-gray-500 text-sm">
              <th className="p-4 font-normal" onClick={() => handleSort('name')}>Name</th>
              <th className="p-4 font-normal text-right" onClick={() => handleSort('games')}>Games</th>
              <th className="p-4 font-normal text-right" onClick={() => handleSort('balance')}>Balance</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map((player, index) => (
              <tr key={player.name} className="border-b">
                <td className="p-4">{player.name}</td>
                <td className="p-4 text-right">{player.games}</td>
                <td className={`p-4 text-right ${player.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {player.balance} CHF
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function GameDetailScreen({ game, onClose, onDelete, onEdit }: { game: Game; onClose: () => void; onDelete: () => void; onEdit: () => void }) {
  return (
    <div className="bg-white min-h-screen">
      <header className="p-4 flex items-center justify-between">
        <button onClick={onClose} className="text-gray-600">
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-xl font-semibold">Game Details</h1>
        <div className="flex space-x-2">
          <button onClick={onEdit} className="text-blue-500">
            <Edit size={20} />
          </button>
          <button onClick={onDelete} className="text-red-500">
            <Trash2 size={20} />
          </button>
        </div>
      </header>
      <div className="p-4">
        <p className="font-semibold">{game.type}</p>
        <p className="text-gray-600">{game.date}</p>
        <p className="mt-2">Total Value: {game.totalValue} CHF</p>
        <div className="mt-4">
          <h2 className="font-semibold mb-2">Players</h2>
          {game.players.map((player, index) => (
            <div key={index} className="flex justify-between items-center p-2 border-b">
              <span>{player.name}</span>
              <span className={player.balance >= 0 ? 'text-green-600' : 'text-red-600'}>
                {player.balance} CHF
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Component() {
  const [games, setGames] = useState<Game[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [filter, setFilter] = useState('All')
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'games' | 'rankings' | 'newGame' | 'gameDetail'>('splash')
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [editingGame, setEditingGame] = useState<Game | null>(null)

  useEffect(() => {
    const savedGames = localStorage.getItem('games')
    const savedPlayers = localStorage.getItem('players')
    if (savedGames) setGames(JSON.parse(savedGames))
    if (savedPlayers) setPlayers(JSON.parse(savedPlayers))
  }, [])

  useEffect(() => {
    localStorage.setItem('games', JSON.stringify(games))
    localStorage.setItem('players', JSON.stringify(players))
  }, [games, players])

  const addOrUpdateGame = (newGame: Game) => {
    setGames(prevGames => {
      const index = prevGames.findIndex(game => game.id === newGame.id)
      if (index !== -1) {
        // Update existing game
        const updatedGames = [...prevGames]
        updatedGames[index] = newGame
        return updatedGames
      } else {
        // Add new game
        return [newGame, ...prevGames]
      }
    })
    updatePlayerStats(newGame)
    setCurrentScreen('games')
    setEditingGame(null)
  }

  const deleteGame = (gameId: number) => {
    const gameToDelete = games.find(game => game.id === gameId)
    if (gameToDelete) {
      updatePlayerStats(gameToDelete, true)
    }
    setGames(prevGames => prevGames.filter(game => game.id !== gameId))
    setCurrentScreen('games')
  }

  const updatePlayerStats = (game: Game, isDeleting: boolean = false) => {
    setPlayers(prevPlayers => {
      const updatedPlayers = [...prevPlayers]
      game.players.forEach(gamePlayer => {
        const playerIndex = updatedPlayers.findIndex(p => p.name === gamePlayer.name)
        if (playerIndex !== -1) {
          updatedPlayers[playerIndex] = {
            ...updatedPlayers[playerIndex],
            games: isDeleting ? updatedPlayers[playerIndex].games - 1 : updatedPlayers[playerIndex].games + 1,
            balance: isDeleting ? updatedPlayers[playerIndex].balance - gamePlayer.balance : updatedPlayers[playerIndex].balance + gamePlayer.balance
          }
        } else if (!isDeleting) {
          updatedPlayers.push({ name: gamePlayer.name, games: 1, balance: gamePlayer.balance })
        }
      })
      return updatedPlayers.filter(player => player.games > 0)
    })
  }

  const addPlayer = () => {
    // This function would typically open a form to add a new player
    console.log("Add player functionality to be implemented")
  }

  const filteredGames = games.filter(game => {
    if (filter === 'All') return true
    if (filter === 'Cash') return game.type === 'Cash Game'
    if (filter === 'Tournaments') return game.type === 'Tournament'
    return true
  })

  const renderScreen = () => {
    switch (currentScreen) {
      case 'splash':
        return <SplashScreen onFinish={() => setCurrentScreen('games')} />
      case 'rankings':
        return <RankingsScreen players={players} onClose={() => setCurrentScreen('games')} onAddPlayer={addPlayer} />
      case 'newGame':
        return <NewGameForm onAddGame={addOrUpdateGame} onClose={() => setCurrentScreen('games')} editGame={editingGame} />
      case 'gameDetail':
        return selectedGame ? (
          <GameDetailScreen
            game={selectedGame}
            onClose={() => setCurrentScreen('games')}
            onDelete={() => deleteGame(selectedGame.id)}
            onEdit={() => {
              setEditingGame(selectedGame)
              setCurrentScreen('newGame')
            }}
          />
        ) : null
      default:
        return (
          <>
            <header className="bg-white p-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold">Games</h1>
              <button onClick={() => setCurrentScreen('newGame')} className="text-gray-600">
                <PlusCircle size={24} />
              </button>
            </header>

            <div className="bg-white p-4 flex space-x-2">
              {['All', 'Cash', 'Tournaments'].map((option) => (
                <button
                  key={option}
                  onClick={() => setFilter(option)}
                  className={`px-4 py-2 rounded-full text-sm ${
                    filter === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>

            <div className="flex-grow overflow-auto">
              {filteredGames.map((game) => (
                <div key={game.id} className="bg-white p-4 mb-2" onClick={() => {
                  setSelectedGame(game)
                  setCurrentScreen('gameDetail')
                }}>
                  <div className="flex justify-between items-center">
                    <h2 className="font-semibold">{game.type}</h2>
                    <span className="text-sm text-gray-500">{game.date}</span>
                  </div>
                  <div className="flex justify-between items-center mt-2 text-sm text-gray-600">
                    <span>Players {game.players.length}</span>
                    <span>Total Value ${game.totalValue}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
    }
  }

  return (
    <div className="max-w-md mx-auto bg-gray-100 min-h-screen flex flex-col">
      {renderScreen()}
      {currentScreen !== 'splash' && (
        <nav className="bg-white border-t flex justify-around p-2">
          <button onClick={() => setCurrentScreen('games')} className={`flex flex-col items-center ${currentScreen === 'games' ? 'text-blue-500' : 'text-gray-600'}`}>
            <Home size={20} />
            <span className="text-xs">Home</span>
          </button>
          <button onClick={() => setCurrentScreen('rankings')} className={`flex flex-col items-center ${currentScreen === 'rankings' ? 'text-blue-500' : 'text-gray-600'}`}>
            <Users size={20} />
            <span className="text-xs">Ranking</span>
          </button>
          <button onClick={() => setCurrentScreen('newGame')} className={`flex flex-col items-center ${currentScreen === 'newGame' ? 'text-blue-500' : 'text-gray-600'}`}>
            <PlusCircle size={20} />
            <span className="text-xs">Games</span>
          </button>
          <button className="text-gray-600 flex flex-col items-center">
            <BarChart2 size={20} />
            <span className="text-xs">Statistics</span>
          </button>
        </nav>
      )}
    </div>
  )
}
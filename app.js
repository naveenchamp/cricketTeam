const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()

app.use(express.json())

const dbpath = path.join(__dirname, 'cricketTeam.db')
let db = null

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000/`)
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}

// Get all players
app.get('/players/', async (request, response) => {
  const getPlayers = `SELECT * FROM cricket_team ORDER BY player_id;`
  const playerArray = await db.all(getPlayers)
  response.send(
    playerArray.map(eachPlayer => convertDbObjectToResponseObject(eachPlayer)),
  )
})

// Add a player
app.post('/players/', async (request, response) => {
  const playerDetails = request.body
  const {playerName, jerseyNumber, role} = playerDetails
  const addPlayer = `
    INSERT INTO 
    cricket_team 
    (player_name, jersey_number, role)
    VALUES 
    ('${playerName}', ${jerseyNumber}, '${role}');`
  const dbresponse = await db.run(addPlayer)
  response.send('Player Added to Team')
})

//request player

app.get('/players/:playerId', async (request, response) => {
  const {playerId} = request.params
  const getPlayerQuery = `SELECT * FROM cricket_team WHERE player_id = ${playerId};`
  const player = await db.get(getPlayerQuery)
  response.send(convertDbObjectToResponseObject(player))
})

//update player

app.put('/players/:playerId/', async (request, response) => {
  const {playerName, jerseyNumber, role} = request.body
  const {playerId} = request.params
  const updatePlayerQuery = `
  UPDATE
    cricket_team
  SET
    player_name = '${playerName}',
    jersey_number = ${jerseyNumber},
    role = '${role}'
  WHERE
    player_id = ${playerId};`

  await db.run(updatePlayerQuery)
  response.send('Player Details Updated')
})

//DELETE PLAYER

app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deletePlayerQuery = `
  DELETE FROM
    cricket_team
  WHERE
    player_id = ${playerId};`
  await db.run(deletePlayerQuery)
  response.send('Player Removed')
})
module.exports = app

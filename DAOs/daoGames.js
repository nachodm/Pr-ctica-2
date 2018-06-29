class daoGames {
    /**
     * Inicializa el DAO de usuarios.
     * 
     * @param {Pool} pool Pool de conexiones MySQL. Todas las operaciones
     *                    sobre la BD se realizarán sobre este pool.
     */
    constructor(pool) {
        this.pool = pool;
    }

    /**
     * 
     * @param {string} gameName Nombre de la partida
     * @param {string} email identificador del jugador que crea la partida
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    newGame(gameName, email, callback){
        this.pool.getConnection((err, connection) => {
            if (err) { callback(`Error de conexión: ${err.message}`, undefined); return;}
            connection.query("INSERT INTO partidas (nombre) VALUES (?)",[gameName],
                (err, result) => {
                    if (err) {
                        connection.release();
                        callback(err, null);
                    } else {
                        connection.query(
                            "INSERT INTO juega_en VALUES ((SELECT id FROM usuarios WHERE login = ?), ?)",[email, result.insertId],
                            (err, rows) => {
                                connection.release();
                                if (err) { callback(err, null);} 
                                else { callback(null, true);}
                            }
                        );
                    }
                }
            );
        });
    }

    getPlayers(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(`Error de conexión: ${err.message}`, undefined); return;}
            connection.query("SELECT p.id, p.nombre FROM partidas p JOIN juega_en j ON j.idPartida=p.id JOIN usuarios u ON u.id=j.idUsuario WHERE email = ?",
            [email],
                (err, rows) => {
                    connection.release();
                    if (err) { callback(err, null);}
                    else { callback(null, rows);}
                }
            );
        });
    }   
    
    join(gameId, email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(`Error de conexión: ${err.message}`, undefined); return;}
            connection.query("INSERT INTO juega_en VALUES ((SELECT id FROM usuarios WHERE login = ?), ?)", [email, gameId],
            (err, result) => {
                if (err) {callback(err, null);}
                else {callback(null, true);}
            })
        })
    }
}

module.exports = {
    daoGames: daoGames
}
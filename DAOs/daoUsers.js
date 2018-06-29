"use strict";

/**
 * Proporciona operaciones para la gestión de usuarios
 * en la base de datos.
 */
class daoUsers {
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
     * Añade un usuario con sus correspondentes atributos a la base de datos.
     * @param {*} user 
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    newUser(user, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(`Error de conexión: ${err.message}`); return;}
            connection.query("INSERT INTO users (login, password) VALUES (?, ?)",
            [user.login, user.password],
                (err, rows) => {
                    connection.release();
                    if (err) { callback(null, false);}
                    else {
                        callback(null, true);
                    }
                }
            );
        });
    }

    /**
     * Determina si un determinado usuario aparece en la BD con la contraseña
     * pasada como parámetro.
     * 
     * @param {string} email Identificador del usuario a buscar
     * @param {string} password Contraseña a comprobar
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    isUserCorrect(email, password, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(`Error de conexión: ${err.message}`, undefined); return; }
            connection.query("SELECT login, password FROM users WHERE login= ? AND password = ?", 
            [email, password],
                (err, rows) => {
                    connection.release();
                    if (err) { callback(err, undefined); return;}
                    if (rows.length === 0) {
                        callback(null, false);
                    }
                    else {
                        callback(null, true); 
                    }
                }
            );
        });
    }

    /**
     * Obtiene y devuelve la lista de partidas en las que participa el usuario.
     * 
     * @param {*} user usuario cuyas partidas se quieren obtener
     * @param {function} callback Función que recibirá el objeto error y el resultado
     */
    getUserGames(email, callback) {
        this.pool.getConnection((err, connection) => {
            if (err) { callback(`Error de conexión: ${err.message}`); return; }
            connection.query("SELECT p.id, p.nombre FROM partidas p JOIN juega_en j ON j.idPartida=p.id JOIN usuarios u ON u.id=j.idUsuario WHERE login = ?",
            [email],
            (err, rows) => {
                connection.release();
                if (err) { callback(err, null);}
                else {
                    callback(null, rows);
                }
            });
        });
    }
}

module.exports = {
    daoUsers: daoUsers
}
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('laskut.db');

interface Lasku {
  id?: number; 
  maksunSaaja: string;
  tilinumero: string;
  erapaiva: string;
  summa: number;
  viitenumero: string;
  onMaksettu: boolean;
}

// Alustus
export const initDB = (): void => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS laskut (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        maksunSaaja TEXT NOT NULL,
        tilinumero TEXT NOT NULL,
        erapaiva TEXT NOT NULL,
        summa REAL NOT NULL,
        viitenumero TEXT NOT NULL,
        onMaksettu INTEGER NOT NULL
      );`,
      [],
      () => console.log('Tietokannan alustus onnistui'),
      (_, error) => {
        console.error('Tietokannan alustus epäonnistui', error);
        return false;
      }
    );
  });
};

// Tallennetaan uusi lasku tietokantaan
export const lisaaLaskuDB = (
  lasku: Lasku,
  callback: (onnistui: boolean, vastaus: SQLite.SQLResultSet | null) => void
): void => {
  db.transaction(tx => {
    tx.executeSql(
      'INSERT INTO laskut (maksunSaaja, tilinumero, erapaiva, summa, viitenumero, onMaksettu) VALUES (?, ?, ?, ?, ?, ?);',
      [lasku.maksunSaaja, lasku.tilinumero, lasku.erapaiva, lasku.summa, lasku.viitenumero, lasku.onMaksettu ? 1 : 0],
      (_, result) => callback(true, result),
      (_, error) => {
        console.error('Laskun lisääminen epäonnistui', error);
        callback(false, null);
        return false;
      }
    );
  });
};

// Haetaan kaikki laskut tietokannasta
export const haeLaskutDB = (
  callback: (onnistui: boolean, laskut: Lasku[]) => void
): void => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT * FROM laskut;',
      [],
      (_, result) => {
        const rows = result.rows._array as Lasku[];
        callback(true, rows);
      },
      (_, error) => {
        console.error('Laskujen haku epäonnistui', error);
        callback(false, []);
        return false;
      }
    );
  });
};




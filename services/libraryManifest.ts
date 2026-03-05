// '../' steps out of /services and into /jsons
import archetypes from '../jsons/master_archetypes_db.json';
import africa from '../jsons/africa_mythologies.json';
import asia from '../jsons/asia_mythologies.json';
import americas from '../jsons/americas_mythologies.json';
import europe from '../jsons/europe_mythologies.json';
import oceania from '../jsons/oceania_mythologies.json';
import mythologies from '../jsons/mythologies.json';

export const MASTER_LIBRARY = {
  archetypes: archetypes,
  mythologies: { africa, asia, americas, europe, oceania, general: mythologies }
};
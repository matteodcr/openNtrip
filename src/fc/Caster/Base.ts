import SourceTable from './SourceTable';
import {countryToAlpha2} from 'country-to-iso';

export default class Base {
  parentSourceTable: SourceTable;
  mountpoint: string; // Datastream mountpoint
  identifier: string; // Source identifier (most time nearest city)
  format: string; // Data format (see data formats table below)
  formatDetails: string; // https://software.rtcm-ntrip.org/wiki/STR#DataFormats
  carrier: number; // Phase L1-L2
  navSystem: string; // Navigation system
  network: string; // Network name
  country: string | null; // ISO 3166 alpha 2 country code
  latitude: number; // Position, Latitude in degree
  longitude: number; // Position, Longitude in degree
  nmea: boolean; // SourceTable requires NMEA input (T) or not (F)
  solution: boolean; // Generated by single base (F) or network (T)
  generator: string; // Generating soft- or hardware
  compression: string; // Compression algorithm
  authentification: string; // access protection for data streams None(N), Basic(B) or Digest(D)
  fee: boolean; // User fee for data access: yes (F) or no (T)
  bitrate: number; // Datarate in bits per second
  misc: string; // Miscellaneous information
  key: string; // for typescript lists

  constructor(sourceTable: SourceTable, line: string[]) {
    if (line.length == 19) {
      this.parentSourceTable = sourceTable;
      this.mountpoint = line[1].trim();
      this.identifier = line[2].trim();
      this.format = line[3].trim();
      this.formatDetails = line[4].trim();
      this.carrier = +line[5];
      this.navSystem = line[6].trim();
      this.network = line[7].trim();
      this.country = countryToAlpha2(line[8].trim());
      this.latitude = +line[9];
      this.longitude = +line[10];
      this.nmea = +line[11] == 1;
      this.solution = +line[12] == 1;
      this.generator = line[13].trim();
      this.compression = line[14].trim();
      this.authentification = line[15].trim();
      this.fee = +line[16] == 1;
      this.bitrate = +line[17];
      this.misc = line[18].trim();
      this.key = this.identifier + ':' + this.mountpoint;
    }
  }
}
